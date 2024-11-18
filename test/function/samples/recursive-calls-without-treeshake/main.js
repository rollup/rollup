function test(callback, index) {
	if (index > 0) {
		test(callback, index - 1);
	}
	callback();
}

let count = 0;
test(() => count++, 3);
assert.strictEqual(count, 4);
