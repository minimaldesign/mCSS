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

export function moveToFirstPosition(arr, key, value) {
  // Find the index of the object that matches the key-value pair
  const index = arr.findIndex((obj) => obj[key] === value);
  // If a match is found
  if (index !== -1) {
    // Remove the object from its current position
    // Note the array destructuring with [] since splice returns an array.
    const [matchedObject] = arr.splice(index, 1);
    // Add the matched object to the beginning of the array
    arr.unshift(matchedObject);
  }
  // Return the modified array
  return arr;
}

export function getInitials(name = ":)") {
  const fullName = name.trim();
  if (fullName.length <= 2) {
    return fullName.toUpperCase();
  }
  const names = fullName.split(/\s+/);
  const firstName = names[0];
  const lastName = names[names.length - 1];
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
  return initials.toUpperCase();
}
