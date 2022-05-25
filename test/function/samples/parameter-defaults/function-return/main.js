function test1() {
	return function (a = 'fallback') {
		return a;
	};
}

assert.strictEqual(test1()(), 'fallback');

const test2 =
	() =>
	(_, a = 'fallback') =>
		a;

assert.strictEqual(test2````, 'fallback');
