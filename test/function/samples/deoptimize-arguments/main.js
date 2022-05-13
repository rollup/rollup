function test(arg = 'fallback') {
	return arg;
}

let condition = false;

changeCondition();

assert.strictEqual(test(condition ? undefined : 'defined'), 'fallback');

function changeCondition() {
	condition = true;
}
