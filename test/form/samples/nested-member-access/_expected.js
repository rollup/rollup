const retained1 = {};
retained1.foo.bar;

const retained2 = new function () {}();
retained2.foo.bar;

const retained3 = undefined;
retained3.foo;
const retained4b = undefined;
retained4b.foo;

const retained5 = 1 + 2;
retained5.foo.bar;

const retained6 = class {};
retained6.foo.bar;

let retained7 = 3;
(retained7++).foo.bar;

globalThis.unknown .x;
