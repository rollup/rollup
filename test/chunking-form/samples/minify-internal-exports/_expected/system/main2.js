System.register(['./generated-shared2.js'], function () {
	'use strict';
	var shared1, shared2, foo;
	return {
		setters: [function (module) {
			shared1 = module.s;
			shared2 = module.a;
			foo = module.b;
		}],
		execute: function () {

			console.log(shared1, shared2, foo);

		}
	};
});
