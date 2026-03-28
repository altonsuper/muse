const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'aianswer.log');
const STATUS_FILE = path.join(__dirname, '..', 'status_monitor.txt');

function timestamp() {
  return new Date().toISOString();
}

function append(filePath, content) {
  fs.appendFileSync(filePath, content + '\n', 'utf8');
}

function log(level, message, meta) {
  const entry = {
    ts: timestamp(),
    level,
    message,
    meta: meta || null,
  };
  append(LOG_FILE, JSON.stringify(entry));
}

function info(message, meta) {
  log('info', message, meta);
}

function warn(message, meta) {
  log('warn', message, meta);
}

function error(message, meta) {
  log('error', message, meta);
}

function updateStatus(message, meta) {
  const line = `[${timestamp()}] ${message}${meta ? ' - ' + JSON.stringify(meta) : ''}`;
  append(STATUS_FILE, line);
}

module.exports = {
  info,
  warn,
  error,
  updateStatus,
};
