const foo = {};

function doIt(x) {
	if (foo[x]) {
		return true;
	}
	foo[x] = true;
}

doIt('x');
assert.ok(doIt('x'), 'foo was not reassigned');
