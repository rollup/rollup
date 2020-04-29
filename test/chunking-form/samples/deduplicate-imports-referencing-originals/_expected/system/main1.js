System.register(['./generated-foo.js'], function () {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			foo = module.f;
		}],
		execute: function () {

			console.log(foo, foo);

		}
	};
});
