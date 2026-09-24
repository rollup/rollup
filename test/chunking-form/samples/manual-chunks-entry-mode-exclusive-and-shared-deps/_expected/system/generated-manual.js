System.register(['./generated-shared.js'], (function (exports) {
	'use strict';
	var shared;
	return {
		setters: [function (module) {
			shared = module.s;
		}],
		execute: (function () {

			const exclusive = 'exclusive';

			const m = exports("m", shared + exclusive);

		})
	};
}));
