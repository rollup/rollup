function first(x) {
	var x = 2;
	assert.ok(x === 2 ? true : false);
}

function second(x) {
	function x() {
		return 2;
	}
	assert.ok(x() === 2 ? true : false);
}

function third([x]) {
	var x = 2;
	assert.ok(x === 2 ? true : false);
}

function fourth([x]) {
	function x() {
		return 2;
	}
	assert.ok(x() === 2 ? true : false);
}

first(1);
second(1);
third([1]);
fourth([1]);
