export { a } from './first';

// This `a` reference should not be re-written because this export is not
// creating a local binding.
assert.equal(typeof a, 'undefined');
