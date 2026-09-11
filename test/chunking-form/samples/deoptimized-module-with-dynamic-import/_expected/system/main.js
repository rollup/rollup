System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const value = 42;

			console.log(value);

			var cjs = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({}, null));
			exports("c", cjs);

		})
	};
}));
