function f(x) {
	if (x) return 1;
	return x ? null : undefined;
}

function g(x) {
	if (x) return 1;
	return globalThis.a && 0;
}

var result = f(globalThis.flag);
var tracked;
if (result) {
	tracked = 'truthy';
} else {
	tracked = 'falsy';
}
assert.strictEqual(tracked, 'falsy');

assert.strictEqual(g(globalThis.flag) ? 'truthy' : 'falsy', 'falsy');
