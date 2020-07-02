function test(unused, used) {
	assert.strictEqual(used, 'used');
}

test(...['unused', 'used']);
