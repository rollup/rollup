import * as staticResolvable from './staticResolvable.js';
assert.strictEqual(staticResolvable.__esModule, true);

export default import('./dynamic.js').then(exports =>
	assert.strictEqual(exports.__esModule, true)
);
