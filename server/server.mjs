import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { readDatabase, updateDatabase } from './storage.mjs';
import { hashPassword, verifyPassword, normalizeEmail, validatePassword, publicUser, createSessionToken, hashSessionToken } from './security.mjs';

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const SESSION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map();
const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const allowedOrderStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
const allowedCategories = ['thit-tuoi', 'suon', 'noi-tang', 'che-bien'];

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
function sendJson(response, status, data, extraHeaders = {}) {
  response.writeHead(status, { ...jsonHeaders, ...extraHeaders });
  response.end(JSON.stringify(data));
}
function parseCookies(request) {
  const cookies = {};
  const text = request.headers.cookie || '';
  for (const item of text.split(';')) {
    const separator = item.indexOf('=');
    if (separator > 0) cookies[item.slice(0, separator).trim()] = item.slice(separator + 1).trim();
  }
  return cookies;
}
function sessionCookie(request, token, maximumAge) {
  const forwardedProto = request.headers['x-forwarded-proto'];
  const isHttps = request.socket.encrypted === true || forwardedProto === 'https';
  const secure = isHttps ? '; Secure' : '';
  return 'xt_meat_session=' + token + '; HttpOnly; SameSite=Lax; Path=/; Max-Age=' + maximumAge + secure;
}
function preventCrossOriginWrite(request) {
  const origin = request.headers.origin;
  if (!origin) return; // Requests without Origin still require a valid session for protected operations.
  let url;
  try { url = new URL(origin); } catch { throw new ApiError(403, 'Origin không hợp lệ.'); }
  const forwardedHost = request.headers['x-forwarded-host'];
  const incomingHost = forwardedHost || request.headers.host;
  if (url.host !== incomingHost) throw new ApiError(403, 'Yêu cầu không cùng nguồn gốc.');
}
async function readBody(request) {
  if (!(request.headers['content-type'] || '').includes('application/json')) throw new ApiError(415, 'Yêu cầu phải là JSON.');
  let text = '';
  for await (const chunk of request) {
    text += chunk.toString('utf8');
    if (text.length > 64 * 1024) throw new ApiError(413, 'Nội dung quá lớn.');
  }
  try {
    const data = JSON.parse(text);
    if (data === null || typeof data !== 'object' || Array.isArray(data)) throw new Error('Not object');
    return data;
  } catch { throw new ApiError(400, 'JSON không hợp lệ.'); }
}
function limitAttempts(request, email) {
  const key = (request.socket.remoteAddress || 'unknown') + ':' + (email || 'unknown');
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.startedAt > RATE_WINDOW_MS) {
    attempts.set(key, { startedAt: now, count: 1 });
    return;
  }
  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) throw new ApiError(429, 'Quá nhiều lần thử. Vui lòng thử lại sau.');
}
function getUserFromDatabase(request, database) {
  const token = parseCookies(request).xt_meat_session;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return null;
  const tokenHash = hashSessionToken(token);
  const session = database.sessions.find(function (item) { return item.tokenHash === tokenHash && Date.parse(item.expiresAt) > Date.now(); });
  if (!session) return null;
  return database.users.find(function (user) { return user.id === session.userId; }) || null;
}
function requireLogin(request, database) {
  const user = getUserFromDatabase(request, database);
  if (!user) throw new ApiError(401, 'Bạn cần đăng nhập.');
  return user;
}
function requireAdmin(request, database) {
  const user = requireLogin(request, database);
  if (user.role !== 'admin') throw new ApiError(403, 'Chỉ quản trị viên được thực hiện thao tác này.');
  return user;
}
function validateProduct(input) {
  if (typeof input.id !== 'string' || !/^[A-Z0-9-]{2,30}$/.test(input.id)) throw new ApiError(400, 'Mã sản phẩm không hợp lệ.');
  if (typeof input.name !== 'string' || input.name.trim().length < 2 || input.name.length > 150) throw new ApiError(400, 'Tên sản phẩm không hợp lệ.');
  if (!allowedCategories.includes(input.category)) throw new ApiError(400, 'Danh mục không hợp lệ.');
  if (!Number.isInteger(input.pricePerKg) || input.pricePerKg <= 0) throw new ApiError(400, 'Giá bán không hợp lệ.');
  if (typeof input.stockKg !== 'number' || !Number.isFinite(input.stockKg) || input.stockKg < 0 || !Number.isInteger(input.stockKg * 2)) throw new ApiError(400, 'Tồn kho phải chia hết cho 0,5 kg.');
  if (typeof input.image !== 'string' || input.image.length > 1000 || (!input.image.startsWith('https://') && !input.image.startsWith('/'))) throw new ApiError(400, 'Ảnh phải dùng HTTPS hoặc đường dẫn nội bộ.');
  return {
    id: input.id, name: input.name.trim(), category: input.category,
    pricePerKg: input.pricePerKg, stockKg: input.stockKg,
    description: String(input.description || '').slice(0, 1500), image: input.image,
    origin: String(input.origin || 'Việt Nam').slice(0, 200),
    featured: input.featured === true, badge: String(input.badge || '').slice(0, 80),
    rating: Number.isFinite(input.rating) ? Math.max(0, Math.min(5, input.rating)) : 4.8,
  };
}
function validateCustomer(customer) {
  if (!customer || typeof customer !== 'object') throw new ApiError(400, 'Thiếu thông tin người nhận.');
  const fullName = String(customer.fullName || '').trim();
  const phone = String(customer.phone || '').trim();
  const address = String(customer.address || '').trim();
  const district = String(customer.district || '').trim();
  const email = String(customer.email || '').trim();
  if (fullName.length < 2 || fullName.length > 100) throw new ApiError(400, 'Tên người nhận không hợp lệ.');
  if (!/^0\d{9,10}$/.test(phone)) throw new ApiError(400, 'Số điện thoại không hợp lệ.');
  if (address.length < 5 || address.length > 250 || district.length < 2 || district.length > 100) throw new ApiError(400, 'Địa chỉ không hợp lệ.');
  if (email && normalizeEmail(email) === null) throw new ApiError(400, 'Email không hợp lệ.');
  if (customer.paymentMethod !== 'cod' && customer.paymentMethod !== 'transfer') throw new ApiError(400, 'Phương thức thanh toán không hợp lệ.');
  return { fullName, phone, address, district, email, note: String(customer.note || '').slice(0, 500), paymentMethod: customer.paymentMethod };
}
async function handleApi(request, response, pathname) {
  const method = request.method;
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) preventCrossOriginWrite(request);
  if (method === 'GET' && pathname === '/api/products') {
    const database = await readDatabase();
    return sendJson(response, 200, { products: database.products });
  }
  if (method === 'GET' && pathname === '/api/auth/me') {
    const database = await readDatabase();
    const user = getUserFromDatabase(request, database);
    return sendJson(response, 200, { user: user ? publicUser(user) : null });
  }
  if (method === 'POST' && pathname === '/api/auth/register') {
    const body = await readBody(request);
    const email = normalizeEmail(body.email);
    limitAttempts(request, email);
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    if (!email || fullName.length < 2 || fullName.length > 100 || !validatePassword(body.password)) throw new ApiError(400, 'Họ tên, email hoặc mật khẩu không hợp lệ (tối thiểu 10 ký tự).');
    const result = await updateDatabase(async function (database) {
      if (database.users.some(function (user) { return user.email === email; })) throw new ApiError(409, 'Email này đã được sử dụng.');
      const user = { id: randomUUID(), email, fullName, role: 'customer', passwordHash: await hashPassword(body.password), createdAt: new Date().toISOString() };
      const token = createSessionToken();
      database.users.push(user);
      database.sessions.push({ tokenHash: hashSessionToken(token), userId: user.id, expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString() });
      return { user: publicUser(user), token };
    });
    return sendJson(response, 201, { user: result.user }, { 'Set-Cookie': sessionCookie(request, result.token, SESSION_DURATION_MS / 1000) });
  }
  if (method === 'POST' && pathname === '/api/auth/login') {
    const body = await readBody(request);
    const email = normalizeEmail(body.email);
    limitAttempts(request, email);
    const database = await readDatabase();
    const user = database.users.find(function (item) { return item.email === email; });
    if (!user || typeof body.password !== 'string' || !(await verifyPassword(body.password, user.passwordHash))) throw new ApiError(401, 'Email hoặc mật khẩu không đúng.');
    const token = createSessionToken();
    await updateDatabase(async function (current) {
      current.sessions = current.sessions.filter(function (session) { return Date.parse(session.expiresAt) > Date.now(); });
      current.sessions.push({ tokenHash: hashSessionToken(token), userId: user.id, expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString() });
    });
    return sendJson(response, 200, { user: publicUser(user) }, { 'Set-Cookie': sessionCookie(request, token, SESSION_DURATION_MS / 1000) });
  }
  if (method === 'POST' && pathname === '/api/auth/logout') {
    const token = parseCookies(request).xt_meat_session;
    if (token) await updateDatabase(async function (database) { database.sessions = database.sessions.filter(function (session) { return session.tokenHash !== hashSessionToken(token); }); });
    return sendJson(response, 200, { success: true }, { 'Set-Cookie': sessionCookie(request, '', 0) });
  }
  if (method === 'GET' && pathname === '/api/orders') {
    const database = await readDatabase();
    const user = requireLogin(request, database);
    const orders = database.orders.filter(function (order) { return order.userId === user.id; });
    return sendJson(response, 200, { orders });
  }
  const orderMatch = pathname.match(/^\/api\/orders\/([A-Z0-9-]+)$/);
  if (method === 'GET' && orderMatch) {
    const database = await readDatabase();
    const user = requireLogin(request, database);
    const order = database.orders.find(function (item) { return item.id === orderMatch[1]; });
    if (!order || (order.userId !== user.id && user.role !== 'admin')) throw new ApiError(404, 'Không tìm thấy đơn hàng.');
    return sendJson(response, 200, { order });
  }
  if (method === 'POST' && pathname === '/api/orders') {
    const body = await readBody(request);
    const customer = validateCustomer(body.customer);
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) throw new ApiError(400, 'Giỏ hàng không hợp lệ.');
    const result = await updateDatabase(async function (database) {
      const user = requireLogin(request, database);
      const items = [];
      const seenProducts = new Set();
      let subtotal = 0;
      for (const inputItem of body.items) {
        if (!inputItem || typeof inputItem.productId !== 'string') throw new ApiError(400, 'Sản phẩm không hợp lệ.');
        if (seenProducts.has(inputItem.productId)) throw new ApiError(400, 'Sản phẩm bị trùng trong giỏ.');
        seenProducts.add(inputItem.productId);
        const product = database.products.find(function (candidate) { return candidate.id === inputItem.productId; });
        const weight = inputItem.quantityKg;
        if (!product || !Number.isFinite(weight) || weight < 0.5 || !Number.isInteger(weight * 2) || weight > product.stockKg) throw new ApiError(409, 'Sản phẩm không đủ tồn kho. Vui lòng cập nhật giỏ hàng.');
        const amount = Math.round(product.pricePerKg * weight);
        subtotal += amount;
        items.push({ productId: product.id, productName: product.name, pricePerKg: product.pricePerKg, quantityKg: weight });
      }
      const shipping = subtotal >= 350000 ? 0 : 25000;
      const order = {
        id: 'XT-' + randomUUID().slice(0, 8).toUpperCase(), userId: user.id,
        createdAt: new Date().toISOString(), customer, items,
        subtotal, shipping, total: subtotal + shipping, status: 'pending',
      };
      for (const item of items) {
        const product = database.products.find(function (candidate) { return candidate.id === item.productId; });
        product.stockKg = Math.round((product.stockKg - item.quantityKg) * 2) / 2;
      }
      database.orders.unshift(order);
      return order;
    });
    return sendJson(response, 201, { order: result });
  }
  if (method === 'GET' && pathname === '/api/admin/orders') {
    const database = await readDatabase();
    requireAdmin(request, database);
    return sendJson(response, 200, { orders: database.orders });
  }
  if (method === 'POST' && pathname === '/api/admin/products') {
    requireAdmin(request, await readDatabase());
    const body = await readBody(request);
    const product = validateProduct(body.product);
    const result = await updateDatabase(async function (database) {
      requireAdmin(request, database);
      if (database.products.some(function (item) { return item.id === product.id; })) throw new ApiError(409, 'Mã sản phẩm đã tồn tại.');
      database.products.push(product);
      return product;
    });
    return sendJson(response, 201, { product: result });
  }
  const productMatch = pathname.match(/^\/api\/admin\/products\/([A-Z0-9-]+)$/);
  if (productMatch && (method === 'PUT' || method === 'DELETE')) {
    requireAdmin(request, await readDatabase());
    const body = method === 'PUT' ? await readBody(request) : null;
    const product = method === 'PUT' ? validateProduct(body.product) : null;
    await updateDatabase(async function (database) {
      requireAdmin(request, database);
      const index = database.products.findIndex(function (item) { return item.id === productMatch[1]; });
      if (index < 0) throw new ApiError(404, 'Không tìm thấy sản phẩm.');
      if (method === 'PUT') {
        if (product.id !== productMatch[1]) throw new ApiError(400, 'Không thể thay đổi mã sản phẩm.');
        database.products[index] = product;
      } else {
        if (database.orders.some(function (order) { return order.items.some(function (item) { return item.productId === productMatch[1]; }); })) throw new ApiError(409, 'Không được xóa sản phẩm đã có đơn hàng. Hãy cập nhật tồn kho thành 0.');
        database.products.splice(index, 1);
      }
    });
    return sendJson(response, 200, { success: true });
  }
  const statusMatch = pathname.match(/^\/api\/admin\/orders\/([A-Z0-9-]+)\/status$/);
  if (statusMatch && method === 'PATCH') {
    const body = await readBody(request);
    if (!allowedOrderStatuses.includes(body.status)) throw new ApiError(400, 'Trạng thái không hợp lệ.');
    const result = await updateDatabase(async function (database) {
      requireAdmin(request, database);
      const order = database.orders.find(function (item) { return item.id === statusMatch[1]; });
      if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng.');
      if (order.status === 'cancelled' && body.status !== 'cancelled') throw new ApiError(409, 'Không thể kích hoạt lại đơn hàng đã hủy.');
      if (body.status === 'cancelled' && order.status !== 'cancelled') {
        for (const line of order.items) {
          const product = database.products.find(function (item) { return item.id === line.productId; });
          if (product) product.stockKg += line.quantityKg;
        }
      }
      order.status = body.status;
      return order;
    });
    return sendJson(response, 200, { order: result });
  }
  throw new ApiError(404, 'API không tồn tại.');
}

const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon' };
async function serveStatic(request, response, pathname) {
  if (request.method !== 'GET' && request.method !== 'HEAD') throw new ApiError(405, 'Method không hỗ trợ.');
  const distPath = resolve('dist');
  const requested = decodeURIComponent(pathname);
  const resolved = resolve(distPath, '.' + requested);
  if (resolved !== distPath && !resolved.startsWith(distPath + sep)) throw new ApiError(403, 'Đường dẫn không hợp lệ.');
  let filePath = resolved;
  try {
    const information = await stat(filePath);
    if (!information.isFile()) filePath = resolve(distPath, 'index.html');
  } catch { filePath = resolve(distPath, 'index.html'); }
  const file = await readFile(filePath);
  response.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
  response.end(request.method === 'HEAD' ? undefined : file);
}

export const app = createServer(async function (request, response) {
  try {
    const pathname = new URL(request.url || '/', 'http://localhost').pathname;
    if (pathname.startsWith('/api/')) {
      await handleApi(request, response, pathname);
    } else {
      await serveStatic(request, response, pathname);
    }
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    if (status === 500) console.error('Server error:', error);
    sendJson(response, status, { error: status === 500 ? 'Máy chủ gặp sự cố.' : error.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, function () { console.log('XT Meat API running at http://' + HOST + ':' + PORT); });
}
