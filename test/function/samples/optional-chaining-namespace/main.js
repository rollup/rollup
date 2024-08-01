import * as other from './other.js';

assert.ok(other?.default ? true : false);
assert.ok(other?.doesNotExist ? false : true);
