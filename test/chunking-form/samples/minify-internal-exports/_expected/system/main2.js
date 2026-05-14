System.register(['./generated-shared2.js'], (function () {
	'use strict';
	var shared1, shared2, foo;
	return {
		setters: [function (module) {
			shared1 = module.s;
			shared2 = module.b;
			foo = module.a;
		}],
		execute: (function () {

			console.log(shared1, shared2, foo);

		})
	};
}));
