import { lib } from './lib.js';

assert.strictEqual(lib.object.a, 'a');
log(lib);

function log(lib) {
	assert.strictEqual(lib.object.b, 'b');
}
