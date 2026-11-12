import utils from './utils.js';
import { add } from './utils.js';

assert.equal(add(1, 2), 3);
assert.deepEqual(Object.keys(utils).sort(), ['add', 'default']);
assert.equal(utils.add(1, 2), 3);
