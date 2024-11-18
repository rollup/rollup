function test() {}

test.mutate = a => (a.mutated = true);

const obj = { mutated: false };
test.mutate(obj);

assert.strictEqual(obj.mutated ? 'OK' : 'FAIL', 'OK');
