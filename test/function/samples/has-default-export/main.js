import direct from './direct.js';
import indirect from './indirect.js';
import reexport1 from './reexport1.js';
import reexport2 from './reexport2.js';

assert.strictEqual(direct, 'direct');
assert.strictEqual(indirect, 'indirect');
assert.strictEqual(reexport1, 'default');
assert.strictEqual(reexport2, 'foo');
