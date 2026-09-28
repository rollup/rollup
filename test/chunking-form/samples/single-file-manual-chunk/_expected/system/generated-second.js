System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			console.log('b');

			var b = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({}, null));
			exports("b", b);

			console.log('c');

			var c = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({}, null));
			exports("c", c);

		})
	};
}));
