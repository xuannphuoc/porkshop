import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidQuantity, checkQuantity, getDecreasedQuantity, restoreCartItems, restoreOrders,
  restoreProducts, calculateOrderStock
} from '../src/utils/shopLogic.ts';
import { readFileSync } from 'node:fs';

const products = JSON.parse(readFileSync(new URL('../public/data/products.json', import.meta.url), 'utf-8'));

test('initial products JSON has valid product structure and unique IDs', () => {
  assert.equal(restoreProducts(products)?.length, 12);
});
test('quantity must be positive multiples of 0.5', () => {
  for (const value of [0.5, 1, 1.5, 10]) assert.equal(isValidQuantity(value), true);
  for (const value of [0, -0.5, 0.1, 0.75, NaN, Infinity]) assert.equal(isValidQuantity(value), false);
});
test('stock validation rejects overselling', () => {
  assert.equal(checkQuantity(1.5, 1), 'Số lượng vượt quá tồn kho hiện tại.');
  assert.equal(checkQuantity(1, 1), null);
  assert.notEqual(checkQuantity(0.75, 10), null);
});
test('invalid saved cart data is filtered out and IDs are deduplicated', () => {
  assert.deepEqual(restoreCartItems([null, {productId:'P001',quantityKg:1}, {productId:'P001',quantityKg:2}, {productId:'P002',quantityKg:-1}, {productId:'P003',quantityKg:0.5}]), [{productId:'P001',quantityKg:1},{productId:'P003',quantityKg:0.5}]);
  assert.deepEqual(restoreCartItems({cart:'bad'}), []);
});
test('invalid products do not replace default JSON', () => {
  assert.equal(restoreProducts([{...products[0],pricePerKg:-100}]), null);
  assert.equal(restoreProducts([products[0],products[0]]), null);
  assert.deepEqual(restoreProducts([]), []);
});
test('stock decreases after checkout and stays nonnegative', () => {
  const before = products[0].stockKg;
  const result = calculateOrderStock(products, [{productId:products[0].id,quantityKg:1.5}]);
  assert.ok(result);
  assert.equal(result[0].stockKg, before-1.5);
  assert.equal(products[0].stockKg,before);
});
test('stock rejects cart with nonexistent product or excessive quantity', () => {
  assert.equal(calculateOrderStock(products,[{productId:'P999',quantityKg:0.5}]),null);
  assert.equal(calculateOrderStock(products,[{productId:products[0].id,quantityKg:products[0].stockKg+0.5}]),null);
});
test('bad saved orders cannot crash the admin page', () => {
  assert.deepEqual(restoreOrders([null, {}, {id:'invalid',items:[null]}]), []);
});
test('restored valid order is kept and invalid order ignored', () => {
  const customer = {fullName:'Nguyen A',phone:'0901234567',address:'123 Street',district:'HCMC',email:'',note:'',paymentMethod:'cod'};
  const goodOrder = {id:'LM-001',createdAt:new Date().toISOString(),customer,items:[{productId:'P001',productName:'Thịt ba rọi',pricePerKg:165000,quantityKg:1}],subtotal:165000,shipping:25000,total:190000,status:'pending'};
  assert.deepEqual(restoreOrders([goodOrder,{...goodOrder,status:'wrong'}]),[goodOrder]);
});
test('cart cannot checkout with negative or non-increment quantities', () => {
  assert.equal(calculateOrderStock(products,[{productId:'P001',quantityKg:-1}]),null);
  assert.equal(calculateOrderStock(products,[{productId:'P001',quantityKg:0.75}]),null);
});

test('quantity decrease can recover a cart after admin lowers stock', () => {
  assert.equal(getDecreasedQuantity(10, 1), 1);
  assert.equal(getDecreasedQuantity(2, 10), 1.5);
});
