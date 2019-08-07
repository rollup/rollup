function test1() {
	return true ?
		/* kept */

		'expected' :
		'unexpected';
}
assert.strictEqual(test1(), 'expected');

function test2() {
	return false ?
		'unexpected' :
		/* kept */

		'expected';
}
assert.strictEqual(test2(), 'expected');

function test3() {
	return true &&
		/* kept */

		'expected';
}
assert.strictEqual(test3(), 'expected');

function test4() {
	return 'removed',
		/* kept */

		'expected';
}
assert.strictEqual(test4(), 'expected');

try {
  throw true ?

    new Error('expected') :
    null;
} catch (err) {
	assert.strictEqual(err.message, 'expected');
}
