const getArgsInfo = (...args) => {
	if (args.length === 0) {
		return 'no args';
	}
	return 'has args';
};

assert.strictEqual(getArgsInfo(), 'no args');
assert.strictEqual(getArgsInfo(1), 'has args');
