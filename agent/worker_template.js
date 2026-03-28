function createHtmlFile(title, body, script) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #111; color: #f2f2f2; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
      #game { text-align: center; }
      button { margin-top: 16px; padding: 10px 18px; font-size: 16px; }
    </style>
  </head>
  <body>
    <div id="game">
      <h1>${title}</h1>
      <div>${body}</div>
      <button id="action">Click me</button>
    </div>
    <script>
${script}
    </script>
  </body>
</html>`;
}

function generateSampleGameFiles() {
  const file1 = createHtmlFile(
    'Game 1 - Counter Click',
    '<p>Click the button to increase the counter.</p><p>Count: <span id="count">0</span></p>',
    `const button = document.getElementById('action');
const countElement = document.getElementById('count');
let count = 0;
button.textContent = 'Tap me';
button.addEventListener('click', () => {
  count += 1;
  countElement.textContent = count;
});`
  );

  const file2 = createHtmlFile(
    'Game 2 - Simple Dodge',
    '<p>Use the "Move" button and avoid the red square.</p><canvas id="gameCanvas" width="320" height="240" style="border:1px solid #666; background:#000"></canvas>',
    `const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let x = 150;
let y = 110;
let speed = 10;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(x, y, 20, 20);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') x = Math.max(0, x - speed);
  if (event.key === 'ArrowRight') x = Math.min(canvas.width - 20, x + speed);
  if (event.key === 'ArrowUp') y = Math.max(0, y - speed);
  if (event.key === 'ArrowDown') y = Math.min(canvas.height - 20, y + speed);
  draw();
});

draw();`
  );

  return [
    { fileName: 'game1.html', content: file1 },
    { fileName: 'game2.html', content: file2 },
  ];
}

function runTask({ prompt }) {
  const normalized = (prompt || '').toLowerCase();
  const generatedFiles = normalized.includes('game') || normalized.includes('html')
    ? generateSampleGameFiles()
    : [
        {
          fileName: 'result.html',
          content: createHtmlFile('ron_GIT Result', `<p>Generated from prompt: ${prompt}</p>`, `console.log('ron_GIT result loaded');`),
        },
      ];

  return {
    prompt,
    generatedFiles,
    summary: 'Generated HTML output from the requested prompt.',
  };
}

module.exports = { runTask };
