let count = 0;
let foo = false;
let condition = foo && false;
if (!condition) count++;
foo = true;
if (!condition) count++;
assert.strictEqual(count, 2);