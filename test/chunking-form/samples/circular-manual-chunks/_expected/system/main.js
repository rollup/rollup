System.register(['./generated-lib1.js', './generated-lib2.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("lib1", module.l);
		}, null],
		execute: (function () {



		})
	};
}));
