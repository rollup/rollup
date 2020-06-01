System.register(['./generated-lib1b.js', './generated-lib2.js'], function () {
	'use strict';
	var lib1, lib1b, lib2;
	return {
		setters: [function (module) {
			lib1 = module.l;
			lib1b = module.a;
		}, function (module) {
			lib2 = module.l;
		}],
		execute: function () {

			console.log('main1', lib1,  lib1b, lib2);

		}
	};
});
