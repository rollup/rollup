System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var self = Object.freeze({
				get p () { return p$$1; }
			});

			console.log(Object.keys(self));

			var p$$1 = exports('p', 5);

		}
	};
});
