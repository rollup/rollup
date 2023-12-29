System.register(['./lib.js'], (function (exports, module) {
	'use strict';
	var lib;
	return {
		setters: [function (module) {
			lib = module;
			exports("lib", module);
		}],
		execute: (function () {

			console.log(lib);
			module.import('./lib.js').then(console.log);

		})
	};
}));
