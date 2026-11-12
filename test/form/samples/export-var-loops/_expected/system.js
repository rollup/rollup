System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var bodyVar; exports("bodyVar", bodyVar);
			for (const ignored of [1]) var bodyVar = exports("bodyVar", 3);

			var bodyIn; exports("bodyIn", bodyIn);
			for (const key in { a: 1 }) var bodyIn = exports("bodyIn", 4);

			var current; exports("current", current);
			for (var current of [1]) { exports("current", current);
				// nothing
			}

			var inKey; exports("inKey", inKey);
			for (var inKey in { a: 1 }) { exports("inKey", inKey);
				// nothing
			}

			var index; exports("index", index);
			for (var index = exports("index", 0); index < 2; (exports("index", index + 1), index++)) {
				// nothing
			}

		})
	};
}));
