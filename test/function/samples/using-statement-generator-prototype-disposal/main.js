function* generator() {}
async function* asyncGenerator() {}
const object = { *method() {} };

assert.strictEqual(typeof generator.prototype[Symbol.dispose], 'function');
assert.strictEqual(typeof object.method.prototype[Symbol.dispose], 'function');
assert.strictEqual(typeof asyncGenerator.prototype[Symbol.asyncDispose], 'function');
assert.strictEqual(typeof asyncGenerator.prototype[Symbol.dispose], 'undefined');
