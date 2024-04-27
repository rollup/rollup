function f(a) {
	assert.equal(a ? 'OK' : 'FAIL', 'OK');
	a = false;
	assert.equal(a ? 'FAIL' : 'OK', 'OK');
}

f(true);

function g(array) {
	if (array === null) {
		array = [];
	}

	if (array) {
		return 'OK';
	}
	return array;
}

assert.equal(g(null), 'OK');

