const path = require('path');
const fs = require('fs');

const ARCHITECT_PATH = path.join(__dirname, 'agent', 'architect_agent.js');

async function runLocalTest() {
  if (!fs.existsSync(ARCHITECT_PATH)) {
    console.error('Architect agent not found:', ARCHITECT_PATH);
    process.exit(1);
  }

  process.env.ENABLE_GROQ = 'false';
  process.env.NODE_ENV = 'local_test';

  const architect = require(ARCHITECT_PATH);
  if (architect && typeof architect.main === 'function') {
    await architect.main();
    return;
  }

  console.error('Architect agent does not expose a main() function.');
  process.exit(1);
}

runLocalTest().catch((error) => {
  console.error('Local test failed:', error);
  process.exit(1);
});
