function test(condition) {
	do {
		if (condition) {
			break;
		}
		return false;
	} while (true);
	return true;
}

assert.equal(test(false), false);
assert.equal(test(true), true);
