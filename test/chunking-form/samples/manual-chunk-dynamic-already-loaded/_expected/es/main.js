import './generated-manual.js';

const promise = Promise.all([import('./generated-manual.js'), import('./generated-d.js')]).then(() => {
	assert.strictEqual(globalThis.xLoaded, true);
	assert.strictEqual(globalThis.mALoaded, true);
	assert.strictEqual(globalThis.mBLoaded, true);
});

export { promise };
