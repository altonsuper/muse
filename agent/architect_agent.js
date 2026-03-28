const fs = require('fs');
const path = require('path');
const quotaChecker = require('../utils/quota_checker');
const validator = require('../utils/validator');
const config = require('../utils/config');
const groqClient = require('../utils/groq_client');
const logger = require('../utils/logger');
const heartbeat = require('../utils/heartbeat');
const reviewer = require('./reviewer_agent');
const worker = require('./worker_template');

const ROOT = path.resolve(__dirname, '..');
const INPUT_DIR = path.join(ROOT, 'input');
const OUTPUT_DIR = path.join(ROOT, 'output');
const SELECTED_DIR = path.join(ROOT, 'selected');
const PROMPT_FILE = path.join(INPUT_DIR, 'PROMPT.txt');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadPrompt() {
  if (!fs.existsSync(PROMPT_FILE)) {
    return null;
  }
  const raw = fs.readFileSync(PROMPT_FILE, 'utf8').trim();
  return raw.length > 0 ? raw : null;
}

function saveOutputFiles(generatedFiles) {
  generatedFiles.forEach((file) => {
    const destination = path.join(OUTPUT_DIR, file.fileName);
    fs.writeFileSync(destination, file.content, 'utf8');
    logger.info('file.saved', { file: destination });
  });
}

function saveResult(result) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultPath = path.join(OUTPUT_DIR, `result_${timestamp}.json`);
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2), 'utf8');
  logger.info('result.saved', { path: resultPath });
  return resultPath;
}

async function main() {
  ensureDir(INPUT_DIR);
  ensureDir(OUTPUT_DIR);
  ensureDir(SELECTED_DIR);

  const heartbeatId = heartbeat.startHeartbeat(config.getAgentLoopDelay());
  logger.info('architect.start', {
    enableGroq: config.isGroqEnabled(),
    agentLoopDelay: config.getAgentLoopDelay(),
    maxContextFiles: config.getMaxContextFiles(),
  });

  const quota = quotaChecker.getQuota();
  if (!quotaChecker.canConsume(quota)) {
    logger.error('quota.exceeded', { quota });
    heartbeat.stopHeartbeat();
    process.exit(1);
  }

  let prompt = loadPrompt();
  if (prompt === null || prompt.toLowerCase() === 'stop') {
    prompt = 'Create a minimal HTML game with two files.';
    logger.info('prompt.fallback', { prompt });
  }

  if (!validator.isValidPrompt(prompt)) {
    logger.error('prompt.invalid', { prompt });
    heartbeat.stopHeartbeat();
    process.exit(1);
  }

  logger.info('architect.prompt', { prompt });

  const groqResponse = await groqClient.callGroq(prompt);
  let taskResult;

  if (groqResponse.success) {
    taskResult = {
      prompt,
      generatedFiles: [
        {
          fileName: 'groq_response.json',
          content: JSON.stringify(groqResponse.data, null, 2),
        },
      ],
      summary: 'Generated result from Groq API response.',
    };
    logger.info('groq.success', { status: groqResponse.status });
  } else {
    logger.warn('groq.fallback', { reason: groqResponse.message || groqResponse.status });
    taskResult = worker.runTask({ prompt });
  }

  const validation = reviewer.validateResult(taskResult);
  if (!validation.ok) {
    logger.error('review.failed', { errors: validation.errors });
    heartbeat.stopHeartbeat();
    process.exit(1);
  }

  const output = {
    metadata: {
      prompt,
      timestamp: new Date().toISOString(),
      version: 'ron_GIT_v1.0',
      groqEnabled: config.isGroqEnabled(),
    },
    result: taskResult,
  };

  saveOutputFiles(taskResult.generatedFiles || []);
  const savedPath = saveResult(output);
  quotaChecker.consumeQuota();
  logger.info('architect.complete', { savedPath });
  heartbeat.stopHeartbeat();
  logger.updateStatus('Workflow complete', { savedPath });

  console.log('Workflow complete. Result saved to', savedPath);
}

if (require.main === module) {
  main().catch((error) => {
    logger.error('architect.unhandledError', { error: error.message });
    console.error('Architect agent failed:', error);
    process.exit(1);
  });
}

module.exports = { main };
