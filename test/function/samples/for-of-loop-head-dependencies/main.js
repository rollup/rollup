function foo() {
	return ['x', 'y'];
}

const result = [];

for (const i of foo()) {
	const foo = i;
	result.push(i);
}

assert.deepEqual(result, ['x', 'y']);