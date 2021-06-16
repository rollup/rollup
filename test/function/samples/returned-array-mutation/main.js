let push = false;

const getArray = () => {
	const array = [];
	if (push) {
		array.push(true);
	}
	return array;
};

assert.strictEqual(getArray()[0] || false, false);
push = true;
assert.strictEqual(getArray()[0] || false, true);
