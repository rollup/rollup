System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			// This should be included directly in the chunk with preserved exports
			const value1$1 = exports("value1", 'lib1-value');

			// This will have conflicting exports and need a facade
			const value2 = exports("a", 'lib2-value');
			const value1 = exports("v", 'conflict-value'); // Conflicting name

			// This should be included directly in the chunk with preserved exports
			const value3 = exports("value3", 'lib3-value');

			var lib3 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				value3: value3
			});
			exports("l", lib3);

		})
	};
}));
