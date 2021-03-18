import first from './other1.js';
import second from './other2.js';
import './dep.js';

assert.strictEqual(first, 4);
assert.strictEqual(second, 4);
