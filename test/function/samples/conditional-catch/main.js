function g() {
	var result;
	g: {
		try {
			break g;
		} catch (_) {}
		return;
	}
	try {
		throw 'Expected';
	} catch (e) {
		result = e;
	}
	assert.strictEqual(result, 'Expected');
}

g();
