export const promise = (async () => {
	const { dPromise } = await import('./e2.js');
	const D = await dPromise;
	assert.ok(D);
	assert.strictEqual(globalThis.e1Effect, undefined);
})();
