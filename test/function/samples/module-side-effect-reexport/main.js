import { foo } from './index';

assert.ok(foo, 'foo');

// effects in reexporters without side effects are ignored
assert.equal(global.indexEffect, undefined, 'indexEffect');

// effects in reexporters with side effects are retained
assert.ok(global.reexportEffect, 'reexportEffect');

// cleanup
delete global.reexportEffect;
