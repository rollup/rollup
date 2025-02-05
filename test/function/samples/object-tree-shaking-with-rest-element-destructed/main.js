const obj = { a: 1, b: 2 };
const { a: _, ...rest } = obj;
assert.deepStrictEqual(rest, { b: 2 });
