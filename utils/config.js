const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env');
let localEnv = null;

function parseDotEnv(content) {
  const env = {};
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }
    const index = trimmed.indexOf('=');
    if (index <= 0) {
      return;
    }
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    env[key] = value;
  });
  return env;
}

function loadLocalEnv() {
  if (localEnv !== null) {
    return localEnv;
  }
  if (!fs.existsSync(ENV_FILE)) {
    localEnv = {};
    return localEnv;
  }
  try {
    const content = fs.readFileSync(ENV_FILE, 'utf8');
    localEnv = parseDotEnv(content);
  } catch (error) {
    localEnv = {};
  }
  return localEnv;
}

function getEnv(key, fallback) {
  if (process.env[key] !== undefined) {
    return process.env[key];
  }
  const env = loadLocalEnv();
  return env[key] !== undefined ? env[key] : fallback;
}

function getNumber(key, fallback) {
  const raw = getEnv(key);
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getBoolean(key, fallback) {
  const raw = getEnv(key);
  if (raw === undefined || raw === null) {
    return fallback;
  }
  const normalized = String(raw).trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
}

function getGroqApiKeys() {
  const keys = new Set();
  const primaryKey = getEnv('GROQ_API_KEY');
  if (primaryKey) {
    keys.add(primaryKey);
  }
  for (let i = 1; i <= 10; i += 1) {
    const key = getEnv(`GROQ_API_KEY_${i}`);
    if (key) {
      keys.add(key);
    }
  }
  return Array.from(keys);
}

function getGroqModel() {
  return getEnv('GROQ_MODEL', 'llama-3.1-8b-instant');
}

function getAgentLoopDelay() {
  return getNumber('AGENT_LOOP_DELAY', 5000);
}

function getMaxContextFiles() {
  return getNumber('MAX_CONTEXT_FILES', 10);
}

function isGroqEnabled() {
  return getBoolean('ENABLE_GROQ', false);
}

function hasTavily() {
  return !!getEnv('TAVILY_API_KEY');
}

function hasSupabase() {
  return !!getEnv('SUPABASE_URL') && !!getEnv('SUPABASE_KEY');
}

function getFeatures() {
  return {
    groq: isGroqEnabled(),
    search: hasTavily(),
    cloudMemory: hasSupabase(),
    localMemory: true, // Always enabled
  };
}

module.exports = {
  getEnv,
  getNumber,
  getBoolean,
  getGroqApiKeys,
  getGroqModel,
  getAgentLoopDelay,
  getMaxContextFiles,
  isGroqEnabled,
  hasTavily,
  hasSupabase,
  getFeatures,
};
