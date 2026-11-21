import * as direct from './direct.js';
import * as transitive from './transitive.js';

assert.deepEqual(Object.keys(direct), ['existing']);
assert.deepEqual(Object.keys(transitive), ['existing']);
assert.equal(direct.existing, 'value');
assert.equal(transitive.existing, 'value');
assert.equal(direct.missing, undefined);
assert.equal(transitive.missing, undefined);
