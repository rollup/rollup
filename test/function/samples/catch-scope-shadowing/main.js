var e = 'failed1',
	x = 'value';

(function () {
	try {
		// empty
	} catch (e) {
		var e = 'failed2';
	}

	assert.strictEqual(e, undefined);
	assert.strictEqual(x, undefined);
	x = 'failed3';
	return;

	try {
		not_reached();
	} catch (x) {
		var x = 'failed4';
	}
})();

assert.strictEqual(x, 'value');
