System.register('iife', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var self = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
				get p () { return p; }
			}, null));

			console.log(Object.keys(self));

			var p = exports("p", 5);

		})
	};
}));
