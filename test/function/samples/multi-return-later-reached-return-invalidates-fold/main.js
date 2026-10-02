function f() {
	if (globalThis.a) return { prop: 0 };
	if (globalThis.effect()) return { prop: 1 };
	return { prop: 0 };
}

globalThis.effect = () => true;

let reached = false;
if (f().prop) {
	reached = true;
}
assert.strictEqual(reached, true);
