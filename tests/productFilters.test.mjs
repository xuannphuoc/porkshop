import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeVietnameseText, filterAndSortProducts } from '../src/features/products/services/productFilters.ts';
const products = JSON.parse(readFileSync(new URL('../public/data/products.json', import.meta.url), 'utf8'));
test('Vietnamese keyword search ignores accents and letter đ', () => {
  assert.equal(normalizeVietnameseText('Thịt đùi'), 'thit dui');
  const results = filterAndSortProducts(products,'all','THIT BA ROI','featured');
  assert.ok(results.some(product=>product.name === 'Thịt ba rọi'));
});
test('category filtering includes only requested category', () => {
  const result = filterAndSortProducts(products,'suon','','featured');
  assert.ok(result.length > 0);
  assert.ok(result.every(product=>product.category === 'suon'));
});
test('ascending sort by price and descending sort by price are correct', () => {
  const ascending = filterAndSortProducts(products,'all','','price-asc');
  const descending = filterAndSortProducts(products,'all','','price-desc');
  for (let index=1;index<ascending.length;index++) assert.ok(ascending[index].pricePerKg >= ascending[index-1].pricePerKg);
  for (let index=1;index<descending.length;index++) assert.ok(descending[index].pricePerKg <= descending[index-1].pricePerKg);
});
test('filtering does not mutate source JSON array', () => {
  const originalOrder=products.map(product=>product.id);
  filterAndSortProducts(products,'all','','price-desc');
  assert.deepEqual(products.map(product=>product.id),originalOrder);
});
test('search with no matches returns empty list', () => {
  assert.deepEqual(filterAndSortProducts(products,'all','not-a-meat-product','name'),[]);
});
