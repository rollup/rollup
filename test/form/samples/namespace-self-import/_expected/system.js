System.register('iife', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			var self = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
				__proto__: null,
				get p () { return p; }
			}, '__esModule', { value: true }));

			console.log(Object.keys(self));

			var p = exports('p', 5);

		}
	};
});
