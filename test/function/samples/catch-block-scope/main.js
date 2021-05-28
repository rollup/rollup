try {
	throw 'FAIL';
} catch (t) {
	var t = 'PASS';
	assert.strictEqual(t, 'PASS');
}

let a = 1;
let def = 'PASS2';
try {
	throw ['FAIL2', 'PASS1'];
} catch ({ [a]: b, 3: d = def }) {
	let a = 0,
		def = 'FAIL3';
	assert.strictEqual(b, 'PASS1');
	assert.strictEqual(d, 'PASS2');
}
