import './mA.js';
import './x.js';

export const promise = import('./mB.js').then(() => {
	assert.strictEqual(globalThis.xCount, 1);
	assert.strictEqual(globalThis.mACount, 1);
	assert.strictEqual(globalThis.mBCount, 1);
	assert.strictEqual(globalThis.otherCount, 1);
});
