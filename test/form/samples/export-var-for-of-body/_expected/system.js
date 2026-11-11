System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var bodyVar; exports("bodyVar", bodyVar);
			for (const ignored of [1]) var bodyVar = exports("bodyVar", 3);

		})
	};
}));
