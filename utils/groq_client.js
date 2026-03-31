const config = require('./config');

const apiKeys = config.getGroqApiKeys();
let currentKeyIndex = 0;
let lastRequestTimestamp = 0;

function getNextApiKey() {
  if (!apiKeys.length) {
    return null;
  }
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return key;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureDelay() {
  const delayMs = config.getAgentLoopDelay();
  const elapsed = Date.now() - lastRequestTimestamp;
  if (elapsed < delayMs) {
    await sleep(delayMs - elapsed);
  }
}

async function callGroq(prompt) {
  const enabled = config.isGroqEnabled();
  const key = getNextApiKey();
  if (!enabled || !key) {
    return {
      success: false,
      message: 'Groq request disabled or no API key configured. Set ENABLE_GROQ=true and add GROQ_API_KEY / GROQ_API_KEY_1..3.',
      prompt,
    };
  }

  await ensureDelay();
  lastRequestTimestamp = Date.now();

  const model = config.getGroqModel();
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const payload = {
    model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = await response.json();

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: body.error ? body.error.message : 'Unknown API error',
        data: body,
      };
    }

    return {
      success: true,
      status: response.status,
      data: body,
      content: body.choices && body.choices[0] ? body.choices[0].message.content : null,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

module.exports = {
  callGroq,
};
