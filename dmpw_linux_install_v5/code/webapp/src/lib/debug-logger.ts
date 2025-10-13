declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    __DEBUG_LOG_ENABLED__?: boolean;
    enableDebug?: () => void;
    disableDebug?: () => void;
  }
}

(function initConsoleToggle() {
  if (typeof window === 'undefined') return;

  const originalLog = console.log;

  console.debug = (...args) => {
    if (typeof window !== 'undefined' && window.__DEBUG_LOG_ENABLED__) {
      originalLog.apply(console, args);
    }
  };

  window.enableDebug = () => {
    window.__DEBUG_LOG_ENABLED__ = true;
    originalLog('[Logger] console.debug is ENABLED');
  };

  window.disableDebug = () => {
    window.__DEBUG_LOG_ENABLED__ = false;
    originalLog('[Logger] console.debug is DISABLED');
  };

  window.__DEBUG_LOG_ENABLED__ = false;
})();

// * Fix type error
export {};
