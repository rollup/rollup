let value = 0;

1, function(){ value = 1 }();
assert.strictEqual(value, 1);

1, function(){ value = 2 }(), 2;
assert.strictEqual(value, 2);

1, {foo: value = 3 };
assert.strictEqual(value, 3);

1, {foo: value = 4 }, 2;
assert.strictEqual(value, 4);

1, true ? function(){ value = 5 }() : false;
assert.strictEqual(value, 5);

1, true ? function(){ value = 6 }() : false, 2;
assert.strictEqual(value, 6);

1, function(){ value = 7; return true }() ? true : false;
assert.strictEqual(value, 7);

1, function(){ value = 8; return true }() ? true : false, 2;
assert.strictEqual(value, 8);

1, false || function(){ value = 9 }();
assert.strictEqual(value, 9);

1, false || function(){ value = 10 }(), 2;
assert.strictEqual(value, 10);
