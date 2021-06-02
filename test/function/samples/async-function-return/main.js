const foo = async function () {
	return false;
};
const fooResult = foo();
assert.strictEqual(fooResult ? 'retained' : 'ignored', 'retained');

const bar = async () => false;
const barResult = bar();
assert.strictEqual(barResult ? 'retained' : 'ignored', 'retained');
