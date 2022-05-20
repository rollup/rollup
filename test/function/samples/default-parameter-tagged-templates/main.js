const templateTag = ([, a = 'quasiFallback'], b = 'expressionFallback') => {
	assert.strictEqual(a, 'quasiFallback');
	assert.strictEqual(b, 'expressionFallback');
};

templateTag``;
