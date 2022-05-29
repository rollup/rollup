const foo = (a = 'fallback') => a;
const bar = (a = foo) => a;

assert.strictEqual(bar()(), 'fallback');
