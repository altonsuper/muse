const fs = require('fs');
const path = require('path');
const db = require('./db_client');

const MEMORY_FILE = path.join(__dirname, '..', '.memory.json');

// Migration Logic
function migrateOldMemory() {
  if (!fs.existsSync(MEMORY_FILE)) {
    return;
  }
  try {
    const raw = fs.readFileSync(MEMORY_FILE, 'utf8');
    const entries = JSON.parse(raw);
    if (Array.isArray(entries)) {
      entries.forEach(entry => {
        db.insert('interactions', entry);
      });
      console.log(`Migrated ${entries.length} entries to local folder database.`);
    }
    fs.unlinkSync(MEMORY_FILE);
  } catch (error) {
    console.error('Failed to migrate old memory:', error.message);
  }
}

// Perform migration on module load
migrateOldMemory();

function loadMemory(limit = 10) {
  const all = db.list('interactions');
  return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
}

function addMemory(entry) {
  return db.insert('interactions', entry);
}

function recordInteraction({ prompt, resultSummary, source, payload, thoughts, context }) {
  const entry = {
    prompt,
    resultSummary,
    source,
    thoughts: thoughts || 'No thoughts recorded.',
    context: context || 'No context used.',
    payload: payload || null,
  };
  return addMemory(entry);
}

function recordLesson({ prompt, errors, context }) {
  const entry = {
    prompt,
    errors, 
    context: context || null,
  };
  return db.insert('lessons', entry);
}

function getRecentLessons(limit = 5) {
  const all = db.list('lessons');
  return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
}

module.exports = {
  loadMemory,
  addMemory,
  recordInteraction,
  recordLesson,
  getRecentLessons,
};
