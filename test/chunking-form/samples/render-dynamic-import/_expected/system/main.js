System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			systemSpecialHandler('./generated-imported-via-special-handler.js', 'main.js', 'imported-via-special-handler.js', null);
			systemSpecialHandler(someVariable, 'main.js', 'null', null);
			systemSpecialHandler(someCustomlyResolvedVariable, 'main.js', 'null', someCustomlyResolvedVariable);

		}
	};
});
