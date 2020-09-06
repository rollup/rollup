System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			var a = exports('a', 'a');
			var b = exports('b', 'a');

			var main2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
				__proto__: null,
				a: a,
				b: b
			}, '__esModule', { value: true }));
			exports('m', main2);

		}
	};
});
