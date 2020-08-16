function test1() {
	return true ?
		/* kept */

		true ?
			'expected' :
			'unexpected' :
		'unexpected';
}
assert.strictEqual(test1(), 'expected');

function test2() {
	return false ?
		'unexpected' :
		/* kept */

		false ?
			'unexpected' :
			'expected';
}
assert.strictEqual(test2(), 'expected');

function test3() {
	return true &&
		/* kept */

		'expected'  || false;
}
assert.strictEqual(test3(), 'expected');

function test4(value) {
	return true &&
		value  || false;
}
assert.strictEqual(test4('expected'), 'expected');

function test5() {
	return 'removed',
		/* kept */

		'expected';
}
assert.strictEqual(test5(), 'expected');

try {
  throw true ?

    new Error('expected') :
    null;
} catch (err) {
	assert.strictEqual(err.message, 'expected');
}

function* test6() {
	yield false ||
	'expected'
}
assert.strictEqual(test6().next().value, 'expected');
