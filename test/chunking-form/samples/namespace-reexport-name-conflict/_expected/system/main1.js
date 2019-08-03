System.register(['./generated-dep.js', 'external', './generated-index.js'], function () {
	'use strict';
	var lib;
	return {
		setters: [function () {}, function () {}, function (module) {
			lib = module.l;
		}],
		execute: function () {

			console.log(lib);

		}
	};
});
