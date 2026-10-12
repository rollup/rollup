function* generator() {}
async function* asyncGenerator() {}
const object = { *method() {} };

assert.strictEqual(typeof generator.prototype[Symbol.dispose], 'function');
assert.strictEqual(typeof object.method.prototype[Symbol.dispose], 'function');
assert.strictEqual(typeof asyncGenerator.prototype[Symbol.asyncDispose], 'function');
assert.strictEqual(typeof asyncGenerator.prototype[Symbol.dispose], 'undefined');

function* generatorWithReturnValue() {
	yield 1;
	return {};
}
async function* asyncGeneratorWithReturnValue() {
	yield 1;
	return {};
}

if (!generatorWithReturnValue()[Symbol.dispose]) {
	assert.fail('the disposal method of generator objects was folded to undefined');
}
if (!asyncGeneratorWithReturnValue()[Symbol.asyncDispose]) {
	assert.fail('the disposal method of async generator objects was folded to undefined');
}
