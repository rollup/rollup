import { nextEven, isEven } from './evens';
import { nextOdd, isOdd } from './odds';

/**
 * The 'evens' and 'odds' modules are configured in such a way that they both
 * have two exported functions: isEven, nextEven, isOdd, and nextOdd. Normally
 * these four functions could be in any order regardless of which depends on
 * which because of JavaScript function hoisting.
 *
 * For the purposes of our test we need to prevent function hoisting, so it has
 * been arranged that two of them will be function expressions assigned to
 * variables. Specifically, isOdd and nextEven both eagerly evaluate their
 * dependencies (i.e. isEven and nextOdd). This allows us to test that exported
 * function declarations are available before what would be a module's
 * "execute" step, per the spec.
 */
assert.equal(nextEven(1), 2);
assert.equal(nextOdd(1), 3);
assert.ok(isOdd(1));
assert.ok(!isOdd(0));
assert.ok(isEven(0));
assert.ok(!isEven(1));
