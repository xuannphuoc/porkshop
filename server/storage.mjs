import { mkdir, readFile, rename, writeFile, chmod } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const DEFAULT_DATA_FILE = resolve('server/data/xt-meat.json');
const DATA_FILE = resolve(process.env.XT_MEAT_DATA_FILE || DEFAULT_DATA_FILE);
let writeQueue = Promise.resolve();

async function initialDatabase() {
  const products = JSON.parse(await readFile(resolve('public/data/products.json'), 'utf8'));
  return { users: [], sessions: [], products, orders: [] };
}

export async function readDatabase() {
  try {
    return JSON.parse(await readFile(DATA_FILE, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    await mkdir(dirname(DATA_FILE), { recursive: true, mode: 0o700 });
    const initial = await initialDatabase();
    try {
      await writeFile(DATA_FILE, JSON.stringify(initial, null, 2), { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    } catch (writeError) {
      if (writeError.code !== 'EEXIST') {
        throw writeError;
      }
    }
    return JSON.parse(await readFile(DATA_FILE, 'utf8'));
  }
}

export async function updateDatabase(changeDatabase) {
  const operation = writeQueue.then(async function () {
    const database = await readDatabase();
    const result = await changeDatabase(database);
    const temporaryFile = DATA_FILE + '.' + randomUUID() + '.tmp';
    await writeFile(temporaryFile, JSON.stringify(database, null, 2), { encoding: 'utf8', mode: 0o600 });
    await rename(temporaryFile, DATA_FILE);
    await chmod(DATA_FILE, 0o600).catch(function () {});
    return result;
  });
  writeQueue = operation.catch(function () {});
  return operation;
}
