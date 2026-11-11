System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var current; exports("current", current);
			for (var current of [1]) { exports("current", current);
				// nothing
			}

		})
	};
}));
