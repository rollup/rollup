System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var index; exports("index", index);
			for (var index = exports("index", 0); index < 2; (exports("index", index + 1), index++)) {
				// nothing
			}

		})
	};
}));
