var a = {};
({x: a} = globalThis.unknown);

var b = {};
({b} = globalThis.unknown);

var {x: c} = globalThis.unknown;

var {d} = globalThis.unknown;

var e = {};
({x: e} = globalThis.unknown);
e.foo = 1;

var f = {};
({f} = globalThis.unknown);
f.foo = 1;

var {x: g} = globalThis.unknown;
g.foo = 1;

var {h} = globalThis.unknown;
h.foo = 1;

var i = {};
[i] = globalThis.unknown;

var [j] = globalThis.unknown;

var k = {};
[,...k] = globalThis.unknown;

var [,...l] = globalThis.unknown;

var m = {};
[m] = globalThis.unknown;
m.foo = 1;

var [n] = globalThis.unknown;
n.foo = 1;

var o = {};
[...o] = globalThis.unknown;
o.foo = 1;

var [...p] = globalThis.unknown;
p.foo = 1;
