Object.defineProperty(Array.prototype, 'isEmpty', {
	get() {
		return this.length === 0;
	}
});

const array = [];
assert.strictEqual(array.isEmpty ? 'works' : 'broken', 'works');
array.push('foo');
assert.strictEqual(array.isEmpty ? 'broken' : 'works', 'works');
