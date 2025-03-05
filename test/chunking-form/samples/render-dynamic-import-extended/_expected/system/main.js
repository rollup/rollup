System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			systemDynamicImportPreload('./generated-has-dependencies.js', ["generated-no-dependencies.js"]);
			systemDynamicImportPreload('./generated-no-dependencies.js', []);
			systemDynamicImportPreload(somethingElse, null);

		})
	};
}));
