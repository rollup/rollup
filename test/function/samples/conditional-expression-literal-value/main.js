let count = 0;
let foo = false;
let bar = false;
let condition = foo ? bar ? true: false : false;
if (!condition) count++;
foo = true;
if (!condition) count++;
assert.strictEqual(count, 2);