import * as second from './second';

assert.equal(second.first.value, 42);
assert.deepEqual(second, {first: {value: 42}})
//console.log("second", second)
//console.log("first", second.first)
