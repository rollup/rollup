System.register(['./generated-lib2.js'], (function (exports) {
	'use strict';
	var lib2;
	return {
		setters: [function (module) {
			lib2 = module.l;
		}],
		execute: (function () {

			const lib1 = exports("l", 'lib1');
			console.log(`${lib1} imports ${lib2}`);

		})
	};
}));
