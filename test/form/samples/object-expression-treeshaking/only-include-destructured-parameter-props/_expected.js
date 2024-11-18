function test({ a, d: { e } }) {
	console.log(a, e);
}

test({
	a: { b: 1, c: 2 },
	d: { e: 4}});
