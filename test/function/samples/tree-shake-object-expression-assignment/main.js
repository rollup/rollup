const result = {};

let foo;
foo = { [(result.x = 1)]: (result.y = 2) };

assert.deepStrictEqual(result, { x: 1, y: 2 });
