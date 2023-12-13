System.register(['./generated-small.js'], (function (exports) {
	'use strict';
	var small;
	return {
		setters: [function (module) {
			small = module.s;
		}],
		execute: (function () {

			const result = exports("r", small + '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789');
			console.log(result);

			const generated = exports("g", 'generated' + result);

		})
	};
}));
