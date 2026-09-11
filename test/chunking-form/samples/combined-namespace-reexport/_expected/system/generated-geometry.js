System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const foo = exports("f", 'foo');

			var volume = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
				foo: foo
			}, null));
			exports("v", volume);

			const bar = exports("b", 'bar');

			var geometry = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
				bar: bar
			}, null));
			exports("g", geometry);

		})
	};
}));
