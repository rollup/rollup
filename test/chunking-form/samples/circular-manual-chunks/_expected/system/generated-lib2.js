System.register(['./generated-lib1.js'], (function (exports) {
	'use strict';
	var lib1;
	return {
		setters: [function (module) {
			lib1 = module.l;
		}],
		execute: (function () {

			const lib2 = exports("l", 'lib2');
			console.log(`${lib2} imports ${lib1}`);

		})
	};
}));
