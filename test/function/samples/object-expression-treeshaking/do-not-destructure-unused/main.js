const {
	x: {
		y: { z }
	},
	a
} = { x: { y: { z: true } }, a: true };
assert.ok(a);

function test({
	x: {
		y: { z }
	},
	a
}) {
	return a;
}
assert.ok(test({ x: { y: { z: true } }, a: true }));
