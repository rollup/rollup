System.register(['./generated-main.js'], function () {
	'use strict';
	var lib;
	return {
		setters: [function (module) {
			lib = module.l;
		}],
		execute: function () {

			console.log(lib, lib.named, lib.named.named);

		}
	};
});
