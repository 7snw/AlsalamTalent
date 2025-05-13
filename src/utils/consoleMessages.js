// src/utils/consoleMessages.js

export const logSuccess = (message) => {
  console.log(
    `%c[SUCCESS]%c ${message}`,
    'color: white; background: green; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
    'color: black;'
  );
};

export const logError = (message) => {
  console.error(
    `%c[ERROR]%c ${message}`,
    'color: white; background: red; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
    'color: black;'
  );
};

export const logInfo = (message) => {
  console.info(
    `%c[INFO]%c ${message}`,
    'color: white; background: #2196F3; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
    'color: black;'
  );
};
