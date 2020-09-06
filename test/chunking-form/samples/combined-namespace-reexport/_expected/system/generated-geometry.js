System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			const foo = exports('f', 'foo');

			var volume = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
				__proto__: null,
				foo: foo
			}, '__esModule', { value: true }));
			exports('v', volume);

			const bar = exports('b', 'bar');

			var geometry = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
				__proto__: null,
				bar: bar
			}, '__esModule', { value: true }));
			exports('g', geometry);

		}
	};
});
