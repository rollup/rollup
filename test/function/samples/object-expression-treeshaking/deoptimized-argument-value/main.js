function test(x) {
	if (x?.y.z) {
		return true;
	}
	return false;
}

assert.ok(test({ y: { z: true } }));
assert.ok(!test({ y: { z: false } }));
