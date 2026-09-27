System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const DEP = exports("D", 'DEP');

			module.import('./generated-m.js').then(m => console.log(m, DEP));

		})
	};
}));
