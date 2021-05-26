let a = 0;
const _1 = function (){}() ? a = 1 : a = 2;
assert.strictEqual(a, 2);

let b = 0;
const _2 = function (){}() || (b = 1);
assert.strictEqual(b, 1);

let c = 0;
const _3 = function (){}() + (c = 1);
assert.strictEqual(c, 1);

let d = 0;
const _4 = function (){}() || function (){}() || (d = 1);
assert.strictEqual(d, 1);

let e = 0;
const _5 = function (){}() + function (){}() + (e = 1);
assert.strictEqual(e, 1);
