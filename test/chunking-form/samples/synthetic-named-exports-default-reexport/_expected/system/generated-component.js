System.register(['./main.js'], function () {
	'use strict';
	var lib;
	return {
		setters: [function (module) {
			lib = module.lib;
		}],
		execute: function () {

			console.log(lib, lib.someExport);

		}
	};
});
