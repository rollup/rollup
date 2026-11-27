const withValueOf = { n: 3, valueOf() { return this.n; } };
assert.strictEqual(withValueOf + 1, 4);
assert.strictEqual(withValueOf - 1, 2);
assert.strictEqual(withValueOf * 2, 6);
assert.strictEqual(withValueOf / 2, 1.5);
assert.strictEqual(withValueOf % 2, 1);
assert.strictEqual(withValueOf ** 2, 9);
assert.strictEqual(withValueOf & 1, 1);
assert.strictEqual(withValueOf | 8, 11);
assert.strictEqual(withValueOf ^ 1, 2);
assert.strictEqual(withValueOf << 1, 6);
assert.strictEqual(withValueOf >> 1, 1);
assert.strictEqual(withValueOf == 3, true);
assert.strictEqual(withValueOf != 4, true);
assert.strictEqual(withValueOf < 4, true);
assert.strictEqual(withValueOf <= 3, true);
assert.strictEqual(withValueOf > 2, true);
assert.strictEqual(withValueOf >= 3, true);
assert.strictEqual(+withValueOf, 3);
assert.strictEqual(-withValueOf, -3);
assert.strictEqual(~withValueOf, -4);

const withToString = { n: 3, toString() { return 'S' + this.n; } };
assert.strictEqual(withToString + 1, 'S31');
assert.strictEqual(1 + withToString, '1S3');
assert.strictEqual(withToString + '', 'S3');

const stringValueOf = { valueOf() { return 'hi'; } };
assert.strictEqual(stringValueOf + '!', 'hi!');

const keyObject = { toString() { return 'a'; } };
assert.strictEqual(keyObject in { a: 1 }, true);

const copied = { ...withValueOf };
assert.strictEqual(copied + 1, 4);

withValueOf.n = 10;
assert.strictEqual(withValueOf + 1, 11);

// A conversion method can mutate the object it is called on; later reads
// must observe the mutation and must not be folded to the pre-call value.
const mutatingValueOf = { n: 0, valueOf() { this.n = 1; return 1; } };
assert.strictEqual(mutatingValueOf + 1, 2);
assert.strictEqual(mutatingValueOf.n, 1);
if (mutatingValueOf.n === 0) {
	assert.fail('valueOf mutation was folded away');
}

// The `'' + o` form takes a different path: `hasEffects` returns early
// for empty-string concatenation without deoptimizing the operand, so
// `include` must deoptimize it instead.
const emptyStringValueOf = { n: 0, valueOf() { this.n = 1; return 1; } };
'' + emptyStringValueOf;
if (emptyStringValueOf.n === 0) {
	assert.fail('valueOf mutation was folded away');
}

// Objects used as computed keys are converted via ToPropertyKey as well
// (string hint, so `toString` is consulted first).
const keyObjectWithToString = { toString() { return 'a'; } };
assert.strictEqual({ a: 1 }[keyObjectWithToString], 1);
assert.strictEqual({ [keyObjectWithToString]: 1 }.a, 1);
