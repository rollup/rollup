System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var modules = exports("default", {
				foo: (unused, exports) => {
					console.log(exports.bar);
					eval('exports.bar = 1');
				}
			});

		})
	};
}));
