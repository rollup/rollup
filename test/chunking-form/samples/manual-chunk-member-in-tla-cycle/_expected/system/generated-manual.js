System.register(['./generated-b.js'], (function (exports) {
	'use strict';
	var b;
	return {
		setters: [function (module) {
			b = module.b;
		}],
		execute: (function () {

			const a = exports("a", 'a' + b);

		})
	};
}));
