const logger = require('./logger');

let intervalId = null;

function startHeartbeat(intervalMs = 30000) {
  if (intervalId !== null) {
    return intervalId;
  }

  logger.info('heartbeat.start', { intervalMs });
  intervalId = setInterval(() => {
    logger.info('heartbeat.pulse', { timestamp: new Date().toISOString() });
    logger.updateStatus('Heartbeat pulse', { alive: true });
  }, intervalMs);
  return intervalId;
}

function stopHeartbeat() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    logger.info('heartbeat.stop');
    intervalId = null;
  }
}

module.exports = {
  startHeartbeat,
  stopHeartbeat,
};
