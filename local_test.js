const path = require('path');
const fs = require('fs');

const ARCHITECT_PATH = path.join(__dirname, 'agent', 'architect_agent.js');

function runLocalTest() {
  if (!fs.existsSync(ARCHITECT_PATH)) {
    console.error('Architect agent not found:', ARCHITECT_PATH);
    process.exit(1);
  }

  process.env.ENABLE_GROQ = 'false';
  process.env.NODE_ENV = 'local_test';

  require(ARCHITECT_PATH);
}

runLocalTest();
