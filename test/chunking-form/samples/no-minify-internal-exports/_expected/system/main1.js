System.register(['./generated-shared2.js'], function () {
	'use strict';
	var shared1, shared2, foo;
	return {
		setters: [function (module) {
			shared1 = module.shared1;
			shared2 = module.shared2;
			foo = module.foo;
		}],
		execute: function () {

			console.log(shared1, shared2, foo);

		}
	};
});
