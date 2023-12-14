System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const value = exports("v", 42);

			console.log(value);
			module.import('./generated-dynamicDep.js');

		})
	};
}));
