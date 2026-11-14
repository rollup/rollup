import './mA.js';
import './x.js';

export const promise = import('./mB.js').then(() => {
	assert.strictEqual(globalThis.xLoaded, true);
	assert.strictEqual(globalThis.mALoaded, true);
	assert.strictEqual(globalThis.mBLoaded, true);
});
