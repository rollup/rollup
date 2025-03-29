define(['exports'], (function (exports) { 'use strict';

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

	exports.lib3 = lib3;
	exports.value1 = value1$1;
	exports.value1$1 = value1;
	exports.value2 = value2;
	exports.value3 = value3;

}));
