System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			console.log('b');

			var b = /*#__PURE__*/Object.freeze({
				__proto__: null
			});
			exports("b", b);

			console.log('c');

			var c = /*#__PURE__*/Object.freeze({
				__proto__: null
			});
			exports("c", c);

		})
	};
}));
