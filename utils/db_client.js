const fs = require('fs');
const path = require('path');

const MEMORY_ROOT = path.resolve(__dirname, '..', 'memory');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getCollectionPath(collection) {
  const dir = path.join(MEMORY_ROOT, collection);
  ensureDir(dir);
  return dir;
}

function insert(collection, data) {
  const dir = getCollectionPath(collection);
  const id = data.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const filePath = path.join(dir, `${id}.json`);
  const record = { ...data, id, createdAt: new Date().toISOString() };
  fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf8');
  return record;
}

function list(collection) {
  const dir = getCollectionPath(collection);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  return files.map(file => {
    try {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }).filter(Boolean);
}

function findOne(collection, filterFn) {
  const all = list(collection);
  return all.find(filterFn);
}

function findMany(collection, filterFn) {
  const all = list(collection);
  return all.filter(filterFn);
}

function remove(collection, id) {
  const filePath = path.join(getCollectionPath(collection), `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

module.exports = {
  insert,
  list,
  findOne,
  findMany,
  remove,
};
