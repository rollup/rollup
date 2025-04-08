// This should be included directly in the chunk with preserved exports
const value1$1 = 'lib1-value';

// This will have conflicting exports and need a facade
const value2 = 'lib2-value';
const value1 = 'conflict-value'; // Conflicting name

// This should be included directly in the chunk with preserved exports
const value3 = 'lib3-value';

var lib3 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	value3: value3
});

export { value2 as a, lib3 as l, value1 as v, value1$1 as value1, value3 };
