import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const passwordHash = await scrypt(password, salt, 64);
  return salt + ':' + passwordHash.toString('hex');
}
export async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string' || !storedHash.includes(':')) {
    return false;
  }
  const [salt, hexHash] = storedHash.split(':');
  const expected = Buffer.from(hexHash, 'hex');
  if (salt.length !== 32 || expected.length !== 64) {
    return false;
  }
  const actual = await scrypt(password, salt, 64);
  return timingSafeEqual(expected, actual);
}
export function createSessionToken() {
  return randomBytes(32).toString('hex');
}
export function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
export function publicUser(user) {
  return { id: user.id, fullName: user.fullName, email: user.email, role: user.role };
}
export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 10 && password.length <= 128;
}
export function normalizeEmail(email) {
  if (typeof email !== 'string') return null;
  const normalized = email.trim().toLowerCase();
  if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return null;
  return normalized;
}
