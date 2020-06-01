System.register(['./generated-lib1b.js', './generated-lib3.js'], function () {
	'use strict';
	var lib1, lib1b, lib3;
	return {
		setters: [function (module) {
			lib1 = module.l;
			lib1b = module.a;
		}, function (module) {
			lib3 = module.l;
		}],
		execute: function () {

			console.log('main2', lib1, lib1b, lib3);

		}
	};
});
