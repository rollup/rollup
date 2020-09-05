export default import('./dynamic.js').then(exports =>
	assert.strictEqual(exports.__esModule, true)
);
