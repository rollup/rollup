function foo() {
	const bar = (options = 'fallback') => {
		return options;
	};
	return bar;
}

assert.strictEqual(foo()(), 'fallback');
