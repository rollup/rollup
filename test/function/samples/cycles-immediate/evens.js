import { nextOdd } from './odds';

/**
 * We go through these gymnastics to eager-bind to nextOdd. This is done to
 * ensure that both this module and the 'odds' module eagerly use something
 * from the other.
 */
export var nextEven = (function() {
  return function(n) {
    var no = nextOdd(n);
    return (no === n + 2) ?
      no - 1 : no;
  };
})(nextOdd);

export function isEven(n) {
  return n % 2 === 0;
}
