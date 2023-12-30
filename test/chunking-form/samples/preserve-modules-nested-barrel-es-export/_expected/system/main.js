System.register(['./module-a/v1/index.js', './module-b/v1/index.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("ModuleA_V1", module);
		}, function (module) {
			exports("ModuleB_V1", module);
		}],
		execute: (function () {



		})
	};
}));
