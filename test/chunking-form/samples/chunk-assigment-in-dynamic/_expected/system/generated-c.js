System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var c = exports('c', {});

			(function (exports) {
				exports.preFaPrint = {
					foo: 1
				};

				exports.faPrint = exports.preFaPrint; 
			} (c));

		})
	};
}));
