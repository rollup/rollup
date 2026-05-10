System.register(['./generated-c.js', './generated-c2.js', './generated-c3.js', './generated-c4.js', './generated-e.js'], (function (exports) {
	'use strict';
	var c;
	return {
		setters: [function (module) {
			c = module.c;
		}, null, null, null, null],
		execute: (function () {

			console.log('a');
			const a = exports("a", 'a' + c);

		})
	};
}));
