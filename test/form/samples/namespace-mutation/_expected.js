const value2 = { mutated: false };
const other2 = 'other';

const value = { mutated: false };
const other = 'other';

var a = /*#__PURE__*/Object.freeze({
	__proto__: null,
	other: other,
	other2: other2,
	value: value,
	value2: value2
});

// It is important that the unused keys are missing from the namespace object
const b = a;
b.value.mutated = true;

if (!value.mutated) {
	throw new Error('Mutation 1 not reflected');
}

b.value2.mutated = true;

if (!value2.mutated) {
	throw new Error('Mutation 2 not reflected');
}

console.log(b.other, b.other2);
