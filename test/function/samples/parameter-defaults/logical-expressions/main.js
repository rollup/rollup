const foo = ((a = 'fallback') => a) || false;
assert.strictEqual(foo(), 'fallback');
