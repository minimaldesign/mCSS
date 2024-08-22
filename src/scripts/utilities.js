// UTILITIES

export function throttle(func, delay) {
  let lastCall = 0;
  let timerId;

  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        lastCall = now;
        func.apply(this, args);
      }, delay);
    } else {
      lastCall = now;
      func.apply(this, args);
    }
  };
}
