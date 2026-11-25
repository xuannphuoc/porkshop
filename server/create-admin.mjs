import { randomUUID } from 'node:crypto';
import { updateDatabase } from './storage.mjs';
import { hashPassword, normalizeEmail, validatePassword } from './security.mjs';

const email = normalizeEmail(process.env.XT_MEAT_ADMIN_EMAIL);
const password = process.env.XT_MEAT_ADMIN_PASSWORD;
const fullName = String(process.env.XT_MEAT_ADMIN_NAME || 'XT Meat Admin').trim();
if (email === null || validatePassword(password) === false || fullName.length < 2) {
  console.error('Thiết lập XT_MEAT_ADMIN_EMAIL, XT_MEAT_ADMIN_PASSWORD (>=10 ký tự), XT_MEAT_ADMIN_NAME (tuỳ chọn).');
  process.exitCode = 1;
} else {
  try {
    const result = await updateDatabase(async function (database) {
      const existing = database.users.find(function (user) { return user.email === email; });
      if (existing) {
        throw new Error('Email đã tồn tại. Không tự nâng quyền tài khoản qua script này.');
      }
      database.users.push({ id: randomUUID(), email, fullName, passwordHash: await hashPassword(password), role: 'admin', createdAt: new Date().toISOString() });
      return email;
    });
    console.log('Đã tạo tài khoản Admin:', result);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
