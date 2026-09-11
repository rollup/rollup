System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var a = exports("a", 'a');
			var b = exports("b", 'a');

			var main2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
				a: a,
				b: b
			}, null));
			exports("m", main2);

		})
	};
}));
