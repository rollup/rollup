export var a, b;
export { a as alias };
for (var a = 1, b = 2 /* last */; a < 3; a++) {}
assert.equal(a, 3);
assert.equal(b, 2);

export var c;
for (var { c } = { c: 4 }; c < 5; c++) {}
assert.equal(c, 5);

export var d;
export { d as dAlias };
for (var d = 1; d < 2; d++) {}
assert.equal(d, 2);

export var e;
for (var e; !e; e = 1) {}
assert.equal(e, 1);

export var f, g;
for (var { f } = { f: 6 }, g = 7; g < 8; g++) {}
assert.equal(f, 6);
assert.equal(g, 8);
