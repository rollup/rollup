var foo = {};

function set(key, value) { foo[key] = value; }

set("bar", 2);
set("qux", 3);

assert.deepStrictEqual(foo, { bar: 2, qux: 3 });
