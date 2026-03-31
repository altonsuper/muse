const validator = require('../utils/validator');

function validateFiles(files) {
  if (!Array.isArray(files)) {
    return ['generatedFiles must be an array'];
  }
  if (files.length === 0) {
    return ['generatedFiles may not be empty'];
  }
  const errors = [];
  files.forEach((file, index) => {
    if (!validator.isNonEmptyString(file.fileName)) {
      errors.push(`generatedFiles[${index}].fileName must be a non-empty string`);
    }
    if (!validator.isNonEmptyString(file.content)) {
      errors.push(`generatedFiles[${index}].content must be a non-empty string`);
    }
  });
  return errors;
}

function validateResult(result) {
  const errors = [];
  if (!result || typeof result !== 'object') {
    errors.push('Result must be an object');
    return { ok: false, errors };
  }
  if (!validator.isNonEmptyString(result.prompt)) {
    errors.push('Result.prompt must be a non-empty string');
  }
  if (!validator.isNonEmptyString(result.summary)) {
    errors.push('Result.summary must be a non-empty string');
  }
  errors.push(...validateFiles(result.generatedFiles));

  const ok = errors.length === 0;
  if (!ok) {
    const memory = require('../utils/memory');
    memory.recordLesson({
      prompt: result.prompt || 'Unknown prompt',
      errors,
      context: result.summary || 'Validation failed'
    });
  }

  return { ok, errors };
}

module.exports = { validateResult };
