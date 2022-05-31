const a = (foo = 'fallback a') => assert.strictEqual(foo, 'fallback a');

const array = [a, (foo = 'fallback b') => assert.strictEqual(foo, 'fallback b')];

array[0]();
array[1]();
