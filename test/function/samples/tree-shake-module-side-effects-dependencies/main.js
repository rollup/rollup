import { value } from './dep.js';
import { sharedValue } from './shared';

assert.ok(value);
assert.strictEqual(sharedValue, 'updated');
