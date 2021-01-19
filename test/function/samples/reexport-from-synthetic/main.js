import { synth, explicit1, explicit2 } from './reexport.js';
assert.strictEqual(synth, 1);
assert.strictEqual(explicit1, 2);
assert.strictEqual(explicit2, 4);
