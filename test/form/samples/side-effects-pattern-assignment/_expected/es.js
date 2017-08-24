var e = {};
({x: e} = globalVar);
e.foo = 1;

var f = {};
({f} = globalVar);
f.foo = 1;

var {x: g} = globalVar;
g.foo = 1;

var {h} = globalVar;
h.foo = 1;

var m = {};
[m] = globalVar;
m.foo = 1;

var [n] = globalVar;
n.foo = 1;

var o = {};
[...o] = globalVar;
o.foo = 1;

var [...p] = globalVar;
p.foo = 1;
