var isFinite = isFinite;

function test(value) {
	return isFinite(value.length);
}

console.log(test('X'));
