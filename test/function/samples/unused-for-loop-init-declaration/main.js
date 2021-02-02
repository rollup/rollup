let result;
let reassigned;

for (var a = (reassigned = 'reassigned'), b = 0, unused = 3; b < 2; b++) {
	result = b;
}

assert.strictEqual(result, 1);
assert.strictEqual(reassigned, 'reassigned');
