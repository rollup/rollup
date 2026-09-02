function* multiReturnGenerator() {
	if (globalThis.unknownCondition) return 0;
	return null;
}

let multiReturnReached = false;
if (multiReturnGenerator()) multiReturnReached = true;
assert.ok(multiReturnReached, 'a multi-return generator call is always truthy');

function* singleReturnGenerator() {
	return 0;
}

let singleReturnReached = false;
if (singleReturnGenerator()) singleReturnReached = true;
assert.ok(singleReturnReached, 'a single-return generator call is always truthy');

const objectWithGenerator = {
	*method() {
		if (globalThis.unknownCondition) return 0;
		return null;
	}
};

let methodReached = false;
if (objectWithGenerator.method()) methodReached = true;
assert.ok(methodReached, 'a generator method call is always truthy');

const generatorExpression = function* () {
	if (globalThis.unknownCondition) return 0;
	return null;
};

let expressionReached = false;
if (generatorExpression()) expressionReached = true;
assert.ok(expressionReached, 'a generator expression call is always truthy');

class ClassWithGenerator {
	*method() {
		if (globalThis.unknownCondition) return 0;
		return null;
	}
}

let classMethodReached = false;
if (new ClassWithGenerator().method()) classMethodReached = true;
assert.ok(classMethodReached, 'a generator class method call is always truthy');

async function* asyncGenerator() {
	if (globalThis.unknownCondition) return 0;
	return null;
}

let asyncGeneratorReached = false;
if (asyncGenerator()) asyncGeneratorReached = true;
assert.ok(asyncGeneratorReached, 'an async generator call is always truthy');
