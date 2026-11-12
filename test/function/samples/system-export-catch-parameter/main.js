export var caught = 'outer';

try {
	throw 0;
} catch (caught) {
	var caught = 1;
	assert.equal(caught, 1);
	var caught;
	for (var caught = 0; caught < 2; caught++);
	assert.equal(caught, 2);
	for (var caught in { x: 1 });
	assert.equal(caught, 'x');
	for (var caught of ['y']);
	assert.equal(caught, 'y');
	{
		var caught = 3;
		assert.equal(caught, 3);
	}
}

assert.equal(caught, 'outer');
caught = 'changed';
assert.equal(caught, 'changed');
