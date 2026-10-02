import './mA.js';
import './x.js';

export const promise = Promise.all([import('./mB.js'), import('./d.js')]).then(() => {
	assert.strictEqual(globalThis.xLoaded, true);
	assert.strictEqual(globalThis.mALoaded, true);
	assert.strictEqual(globalThis.mBLoaded, true);
});
