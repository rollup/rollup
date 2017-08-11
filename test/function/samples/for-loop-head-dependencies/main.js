function foo() {
	return ['x'];
}

const result = [];

for (let i in foo()) {
	const foo = i;
	result.push(foo);
}

assert.deepEqual(result, [0]);