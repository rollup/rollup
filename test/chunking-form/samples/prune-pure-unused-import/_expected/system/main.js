System.register(['./foo.js'], function (exports, module) {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			foo = module.default;
		}, function () {}],
		execute: function () {

			console.log(foo);

		}
	};
});
