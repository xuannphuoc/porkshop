import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCustomerInformation } from '../src/utils/orderValidation.ts';
const validCustomer = {
  fullName: 'Nguyễn Văn A', phone: '0901234567', email: '',
  address: '12 Nguyễn Huệ', district: 'Quận 1', note: '', paymentMethod: 'cod'
};
test('valid checkout information passes for COD or simulated transfer', () => {
  assert.equal(validateCustomerInformation(validCustomer), null);
  assert.equal(validateCustomerInformation({...validCustomer, paymentMethod:'transfer',email:'hello@example.com'}), null);
});
test('checkout rejects invalid customer name', () => {
  assert.match(validateCustomerInformation({...validCustomer,fullName:'A'}),/họ và tên/);
});
test('checkout rejects incorrect phone', () => {
  assert.match(validateCustomerInformation({...validCustomer,phone:'12345'}),/Số điện thoại/);
});
test('checkout rejects invalid optional email', () => {
  assert.match(validateCustomerInformation({...validCustomer,email:'bad@@example'}),/email/);
});
test('checkout rejects missing address and district', () => {
  assert.match(validateCustomerInformation({...validCustomer,address:'12'}),/địa chỉ/);
  assert.match(validateCustomerInformation({...validCustomer,district:' '}),/địa chỉ/);
});
test('checkout rejects unknown payment method', () => {
  assert.match(validateCustomerInformation({...validCustomer,paymentMethod:'cash'}),/thanh toán/);
});
