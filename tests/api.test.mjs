import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const directory = await mkdtemp(join(tmpdir(), 'xt-meat-api-'));
process.env.NODE_ENV = 'test';
process.env.XT_MEAT_DATA_FILE = join(directory, 'database.json');
const { app } = await import('../server/server.mjs');
const { updateDatabase } = await import('../server/storage.mjs');
const { hashPassword } = await import('../server/security.mjs');
await new Promise(function (resolve) { app.listen(0, '127.0.0.1', resolve); });
const address = app.address();
const baseUrl = 'http://127.0.0.1:' + address.port;
const customer = { fullName: 'Nguyễn Văn A', phone: '0901234567', email: 'example@sample.com', address: '11 Đường Hoa', district: 'Quận 1', note: '', paymentMethod: 'cod' };

async function api(path, method = 'GET', data, cookie, origin) {
  const headers = {};
  if (data !== undefined) headers['Content-Type'] = 'application/json';
  if (cookie) headers.Cookie = cookie;
  if (origin) headers.Origin = origin;
  const response = await fetch(baseUrl + path, { method, headers, body: data === undefined ? undefined : JSON.stringify(data), redirect: 'manual' });
  return { status: response.status, data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
}

try {
  await test('XT Meat backend — đăng ký, xác thực, phân quyền, đơn hàng, CRUD', async function (t) {
    await t.test('Sản phẩm công khai và chưa có phiên', async function () {
      const products = await api('/api/products');
      assert.equal(products.status, 200);
      assert.equal(products.data.products.length, 12);
      assert.deepEqual((await api('/api/auth/me')).data, { user: null });
      assert.equal((await api('/api/admin/orders')).status, 401);
    });
    const first = await api('/api/auth/register', 'POST', { fullName: 'Nguyễn A', email: 'CUSTOMER@EXAMPLE.COM', password: 'Sufficient-password-123', role: 'admin' });
    const customerCookie = first.cookie;
    await t.test('Đăng ký mặc định customer bất kể role người dùng gửi lên', async function () {
      assert.equal(first.status, 201);
      assert.equal(first.data.user.role, 'customer');
      assert.ok(customerCookie.startsWith('xt_meat_session='));
      assert.equal((await api('/api/auth/me', 'GET', undefined, customerCookie)).data.user.role, 'customer');
      assert.equal((await api('/api/admin/orders', 'GET', undefined, customerCookie)).status, 403);
      assert.equal((await api('/api/admin/products', 'POST', { product: { id:'X', name:'X'} }, customerCookie)).status, 403);
      assert.equal((await api('/api/admin/products', 'POST', { product: { id:'X', name:'X'} }, customerCookie, 'https://evil.example')).status, 403);
    });
    await t.test('Sai mật khẩu, email trùng, mật khẩu quá ngắn bị từ chối', async function () {
      assert.equal((await api('/api/auth/login', 'POST', { email:'customer@example.com', password:'bad' })).status, 401);
      assert.equal((await api('/api/auth/register', 'POST', { fullName:'B', email:'customer@example.com', password:'valid-password-123' })).status, 400);
      assert.equal((await api('/api/auth/register', 'POST', { fullName:'Bình', email:'customer@example.com', password:'valid-password-123' })).status, 409);
      assert.equal((await api('/api/auth/register', 'POST', { fullName:'A', email:'new@example.com', password:'short' })).status, 400);
    });
    await t.test('Khách hàng chỉ đặt hàng hợp lệ, tồn kho trừ phía server', async function () {
      const result = await api('/api/orders', 'POST', { customer, items:[{ productId:'P001', quantityKg:1 }] }, customerCookie);
      assert.equal(result.status, 201);
      assert.ok(result.data.order.id.startsWith('XT-'));
      assert.equal(result.data.order.total, 165000 + 25000);
      const products = await api('/api/products');
      assert.equal(products.data.products.find(item => item.id === 'P001').stockKg, 24);
      assert.equal((await api('/api/orders', 'GET', undefined, customerCookie)).data.orders.length, 1);
      assert.equal((await api('/api/orders/' + result.data.order.id, 'GET', undefined, customerCookie)).status, 200);
      assert.equal((await api('/api/orders/' + result.data.order.id)).status, 401);
      assert.equal((await api('/api/orders','POST', { customer, items:[{ productId:'P001', quantityKg:100 }] }, customerCookie)).status, 409);
      assert.equal((await api('/api/orders','POST', { customer, items:[{ productId:'P001', quantityKg:0.3 }] }, customerCookie)).status, 409);
      assert.equal((await api('/api/orders','POST', { customer, items:[{ productId:'P001', quantityKg:0.5 },{productId:'P001', quantityKg:0.5}] }, customerCookie)).status, 400);
    });
    const second = await api('/api/auth/register', 'POST', { fullName:'Nguyễn B', email:'second@example.com', password:'Sufficient-password-456' });
    await t.test('Người dùng khác không đọc được đơn người dùng thứ nhất', async function () {
      const firstOrders = await api('/api/orders', 'GET', undefined, customerCookie);
      assert.equal((await api('/api/orders/' + firstOrders.data.orders[0].id, 'GET', undefined, second.cookie)).status, 404);
    });
    await updateDatabase(async function (db) {
      db.users.push({ id:'admin-user', fullName:'XT Meat Admin', email:'admin@example.com', role:'admin', passwordHash: await hashPassword('Admin-secret-789'), createdAt:new Date().toISOString() });
    });
    const admin = await api('/api/auth/login', 'POST', { email:'admin@example.com', password:'Admin-secret-789' });
    const adminCookie = admin.cookie;
    await t.test('Admin đăng nhập được, CRUD product, cập nhật trạng thái', async function () {
      assert.equal(admin.status, 200);
      assert.equal(admin.data.user.role, 'admin');
      assert.equal((await api('/api/admin/orders','GET',undefined,adminCookie)).data.orders.length,1);
      const created = { id:'P999', name:'Thịt thử nghiệm', category:'thit-tuoi', pricePerKg:100000, stockKg:6, image:'https://example.com/test.jpg', description:'Demo', origin:'Việt Nam', featured:false, rating:4.7 };
      assert.equal((await api('/api/admin/products','POST',{product:created},adminCookie)).status,201);
      assert.equal((await api('/api/admin/products','POST',{product:created},adminCookie)).status,409);
      assert.equal((await api('/api/admin/products/P999','PUT',{product:{...created,stockKg:5}},adminCookie)).status,200);
      assert.equal((await api('/api/products')).data.products.find(item => item.id==='P999').stockKg,5);
      assert.equal((await api('/api/admin/products/P999','DELETE',undefined,adminCookie)).status,200);
      const firstOrders = await api('/api/admin/orders','GET',undefined,adminCookie);
      const orderId = firstOrders.data.orders[0].id;
      assert.equal((await api('/api/admin/orders/'+orderId+'/status','PATCH',{status:'cancelled'},customerCookie)).status,403);
      assert.equal((await api('/api/admin/orders/'+orderId+'/status','PATCH',{status:'cancelled'},adminCookie)).status,200);
      assert.equal((await api('/api/products')).data.products.find(item => item.id==='P001').stockKg,25);
      assert.equal((await api('/api/admin/orders/'+orderId+'/status','PATCH',{status:'confirmed'},adminCookie)).status,409);
    });
    await t.test('Đăng xuất thu hồi cookie', async function () {
      assert.equal((await api('/api/auth/logout','POST',{},customerCookie)).status,200);
      assert.equal((await api('/api/auth/me','GET',undefined,customerCookie)).data.user,null);
    });
  });
} finally {
  await new Promise(function (resolve) { app.close(resolve); });
  await rm(directory, { recursive: true, force: true });
}
