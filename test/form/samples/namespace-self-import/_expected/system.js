System.register('iife', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			var self = /*#__PURE__*/Object.freeze({
				get p () { return p; }
			});

			console.log(Object.keys(self));

			var p = exports('p', 5);

		}
	};
});
