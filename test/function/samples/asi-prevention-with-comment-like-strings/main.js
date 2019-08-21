function test() {
	return true ? '/*' : '//'
}

assert.strictEqual(test(), '/*');
