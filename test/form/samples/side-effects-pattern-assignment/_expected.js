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
