const removed1 = {};
const removedResult1 = removed1.foo;

const removed2 = { foo: {} };
const removedResult2 = removed2.foo.bar;

const removed3 = new function () {}();
const removedResult3 = removed3.foo;

const removed4 = !{};
const removedResult4 = removed4.foo;

let removed5a;
const removed5b = removed5a = {};
const removedResult5 = removed5b.foo;

const removed6 = 1 + 2;
const removedResult6 = removed6.foo;

const removed7 = class {};
const removedResult7 = removed7.foo;

let removed8 = 3;
const removedResult8 = (removed8++).foo;

const retained1 = {};
const retainedResult1 = retained1.foo.bar;

const retained2 = new function () {}();
const retainedResult2 = retained2.foo.bar;

const retained3 = void {};
const retainedResult3 = retained3.foo;

let removed4a;
const retained4b = removed4a = undefined;
const retainedResult4 = retained4b.foo;

const retained5 = 1 + 2;
const retainedResult5 = retained5.foo.bar;

const retained6 = class {};
const retainedResult6 = retained6.foo.bar;

let retained7 = 3;
const retainedResult7 = (retained7++).foo.bar;

const retained8 = globalThis.unknown .x;
