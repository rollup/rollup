const {
	a: { e: e1, ...rest1 }
} = { a: { b: { c: 1, d: 1 }, e: 1 }, f: 1 };
assert.deepStrictEqual(rest1, { b: { c: 1, d: 1 } });

const { ...rest2 } = { a: { b: { c: 1, d: 1 }, e: 1 }, f: 1 };
assert.deepStrictEqual(rest2, { a: { b: { c: 1, d: 1 }, e: 1 }, f: 1 });

const {
	a: { e: e3, ...rest3 },
	f
} = { a: { b: { c: 1, d: 1 }, e: 1 }, f: 1 };
assert.strictEqual(e3, 1);
assert.strictEqual(f, 1);
assert.deepStrictEqual(rest3, { b: { c: 1, d: 1 } });
