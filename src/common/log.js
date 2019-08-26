const {logLevel} = require('../config');
const chalk = require('chalk');

// noinspection JSPotentiallyInvalidConstructorUsage
const colors = new chalk.constructor({enabled: true});
const LogRange = ['debug', 'info', 'warn', 'error'];
const logLevelRange = LogRange.indexOf(logLevel);

function shouldViewLog(logLevelName) {
  let i = LogRange.indexOf(logLevelName);
  if (i === undefined) {
    i = LogRange.length - 1;
  }
  return i >= logLevelRange;
}

function getPrefix(logLevelName) {
  const message = `${new Date().toISOString()} ${logLevelName.toUpperCase()}: `;
  switch (logLevelName) {
    case 'info':
      return colors.green.bold(message);
    case 'debug':
      return colors.blue.bold(message);
    case 'warn':
      return colors.yellow.bold(message);
    case 'error':
      return colors.red.bold(message);
    default:
      return message;
  }
}

function writeLog(levelName, messages) {
  if (shouldViewLog(levelName)) {
    console.log(getPrefix(levelName), ...messages);
  }
}

function logInfo(...messages) {
  writeLog('info', messages);
}

function logWarn(...messages) {
  writeLog('warn', messages);
}

function logDebug(...messages) {
  if (logLevelRange > 0) {
    return;
  }
  writeLog('debug', messages);
}

function logError(...messages) {
  writeLog('error', messages);
}

module.exports = {
  debug: logDebug,
  error: logError,
  info: logInfo,
  warn: logWarn
};
