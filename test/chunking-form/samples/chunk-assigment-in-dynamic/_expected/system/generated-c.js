System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var c = {};

			var hasRequiredC;

			function requireC () {
				if (hasRequiredC) return c;
				hasRequiredC = 1;
				(function (exports) {
					exports.preFaPrint = {
						foo: 1
					};

					exports.faPrint = exports.preFaPrint; 
				} (c));
				return c;
			}

			var cExports = exports("c", /*@__PURE__*/ requireC());

		})
	};
}));
