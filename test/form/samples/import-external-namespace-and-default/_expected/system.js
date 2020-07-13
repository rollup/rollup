System.register(['foo'], function () {
	'use strict';
	var bar, foo;
	return {
		setters: [function (module) {
			bar = module.bar;
			foo = module.default;
		}],
		execute: function () {

			console.log( bar );

			console.log( foo );

		}
	};
});
