System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const DEP = exports("D", 'DEP');

			Promise.all([module.import('./generated-dynamic.js'), module.import('./generated-dynamic2.js'), module.import('./generated-dynamic3.js')]).then(
				results => console.log(results, DEP)
			);

		})
	};
}));
