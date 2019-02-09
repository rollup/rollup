function nested() {
	var exports = {
		x: 99
	};
	exports.x++;
	assert.equal(exports.x, 100);
	assert.equal(x, 1);
	x++;
	assert.equal(exports.x, 100);
	assert.equal(x, 2);
}

export var x = 1;

nested();
