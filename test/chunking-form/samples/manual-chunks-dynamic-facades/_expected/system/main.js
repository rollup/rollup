System.register(['./generated-dynamic.js'], function (exports, module) {
	'use strict';
	var DEP;
	return {
		setters: [function (module) {
			DEP = module.DEP;
		}],
		execute: function () {

			Promise.all([module.import('./generated-dynamic.js'), module.import('./generated-dynamic2.js'), module.import('./generated-dynamic3.js')]).then(
				results => console.log(results, DEP)
			);

		}
	};
});
