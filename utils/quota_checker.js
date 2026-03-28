const fs = require('fs');
const path = require('path');

const QUOTA_FILE = path.join(__dirname, '..', '.quota.json');
const DEFAULT_QUOTA = { count: 0, limit: 1000, lastUpdate: null };

function readQuota() {
  if (!fs.existsSync(QUOTA_FILE)) {
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(DEFAULT_QUOTA, null, 2), 'utf8');
    return { ...DEFAULT_QUOTA };
  }
  try {
    return JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf8'));
  } catch (err) {
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(DEFAULT_QUOTA, null, 2), 'utf8');
    return { ...DEFAULT_QUOTA };
  }
}

function writeQuota(quota) {
  fs.writeFileSync(QUOTA_FILE, JSON.stringify(quota, null, 2), 'utf8');
}

function getQuota() {
  return readQuota();
}

function canConsume(quota) {
  return quota.count < quota.limit;
}

function consumeQuota() {
  const quota = readQuota();
  if (!canConsume(quota)) {
    throw new Error('Quota limit reached');
  }
  quota.count += 1;
  quota.lastUpdate = new Date().toISOString();
  writeQuota(quota);
  return quota;
}

module.exports = {
  getQuota,
  canConsume,
  consumeQuota,
};
