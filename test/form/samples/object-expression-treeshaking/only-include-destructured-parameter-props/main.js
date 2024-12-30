function test({ a, d: { e } }) {
	console.log(a, e);
}

test({
	a: { b: 1, c: 2 },
	d: { e: 4, f: 5 },
	g: 6
});
