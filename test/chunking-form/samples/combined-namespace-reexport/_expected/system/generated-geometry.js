System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const foo = exports("f", 'foo');

			var volume = /*#__PURE__*/Object.freeze({
				__proto__: null,
				foo: foo
			});
			exports("v", volume);

			const bar = exports("b", 'bar');

			var geometry = /*#__PURE__*/Object.freeze({
				__proto__: null,
				bar: bar
			});
			exports("g", geometry);

		})
	};
}));
