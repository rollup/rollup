let errored = false;
try {
	const a = {};
	Object.freeze(a);
	a.notAllowed = 1;
} catch (error) {
	errored = true;
}
assert.ok(errored);

const b = { mutated: false };
Object.defineProperty(b, 'mutated', { value: true });
assert.ok(b.mutated ? true : false);

const c = { mutated: false };
Object.defineProperties(c, { mutated: { value: true } });
assert.ok(c.mutated ? true : false);
