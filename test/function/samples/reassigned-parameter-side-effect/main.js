function foo(a) {
	a.x;
}
let sideEffect = false
foo({
	x: 1
});
foo({
	get x() {
		sideEffect = true
	},
});

assert.equal(sideEffect, true)
