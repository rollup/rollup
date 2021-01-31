let result;
let reassigned;

for (var a = (reassigned = 'reassigned'), b = 0; b < 2; b++) {
	result = b;
}

assert.strictEqual(result, 1);
assert.strictEqual(reassigned, 'reassigned');
