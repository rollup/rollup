import './dep.js';

error = 1;
try {
	throw new Error('failed');
} catch (error) {
	var error = 2;
	assert.equal(error, 2);
}
assert.equal(error, 1);
