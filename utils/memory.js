const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, '..', '.memory.json');
const MAX_MEMORY_ITEMS = 100;

function readMemory() {
  if (!fs.existsSync(MEMORY_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(MEMORY_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function writeMemory(entries) {
  const sliced = entries.slice(-MAX_MEMORY_ITEMS);
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(sliced, null, 2), 'utf8');
  return sliced;
}

function loadMemory() {
  return readMemory();
}

function addMemory(entry) {
  const memory = readMemory();
  memory.push(entry);
  return writeMemory(memory);
}

function recordInteraction({ prompt, resultSummary, source, payload }) {
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    timestamp: new Date().toISOString(),
    prompt,
    resultSummary,
    source,
    payload: payload || null,
  };
  return addMemory(entry);
}

module.exports = {
  loadMemory,
  addMemory,
  recordInteraction,
};
