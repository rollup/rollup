System.register(['./generated-dynamic.js'], function (exports, module) {
	'use strict';
	var DEP;
	return {
		setters: [function (module) {
			DEP = module.DEP;
		}],
		execute: function () {

			Promise.all([module.import('./generated-dynamic.js'), module.import('./generated-chunk.js'), module.import('./generated-chunk2.js')]).then(
				results => console.log(results, DEP)
			);

		}
	};
});
