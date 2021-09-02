System.register(['./generated-lib.js'], (function () {
	'use strict';
	var lib;
	return {
		setters: [function (module) {
			lib = module.l;
		}],
		execute: (function () {

			console.log(lib, lib.foo, lib.bar, lib.baz);

		})
	};
}));
