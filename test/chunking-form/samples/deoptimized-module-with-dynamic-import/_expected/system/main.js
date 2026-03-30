System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const value = 42;

			console.log(value);

			var cjs = /*#__PURE__*/Object.freeze({
				__proto__: null
			});
			exports("c", cjs);

		})
	};
}));
