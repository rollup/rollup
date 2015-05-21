import { isEven } from './evens';

export function nextOdd(n) {
  return isEven(n) ? n + 1 : n + 2;
}

/**
 * We go through these gymnastics to eager-bind to isEven. This is done to
 * ensure that both this module and the 'evens' module eagerly use something
 * from the other.
 */
export var isOdd = (function(isEven) {
  return function(n) {
    return !isEven(n);
  };
})(isEven);
