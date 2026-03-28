function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidPrompt(value) {
  return isNonEmptyString(value) && value.trim().toLowerCase() !== 'stop';
}

function isValidJson(value) {
  if (!isNonEmptyString(value)) {
    return false;
  }
  try {
    JSON.parse(value);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  isNonEmptyString,
  isValidPrompt,
  isValidJson,
};
