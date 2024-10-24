let result = null;

function test() {}
test.a = value => (result = value);

const { a } = test;
a(1);

assert.strictEqual(result, 1);
