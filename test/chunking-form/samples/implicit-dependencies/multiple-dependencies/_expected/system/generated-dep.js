System.register(['./generated-lib1b.js', './generated-lib2.js', './generated-lib3.js'], function () {
	'use strict';
	var lib1, lib2, lib3;
	return {
		setters: [function (module) {
			lib1 = module.l;
		}, function (module) {
			lib2 = module.l;
		}, function (module) {
			lib3 = module.l;
		}],
		execute: function () {

			console.log(lib1, lib2, lib3);

		}
	};
});
