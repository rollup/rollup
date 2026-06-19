System.register(['./v1.0/chunk.d.ts', './v1.0/chunk2.d.ts'], (function () {
	'use strict';
	var num, num$1;
	return {
		setters: [function (module) {
			num = module.n;
		}, function (module) {
			num$1 = module.n;
		}],
		execute: (function () {

			console.log(num + num$1);

		})
	};
}));
