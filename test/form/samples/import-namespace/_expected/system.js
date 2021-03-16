System.register(['foo', 'bar'], function () {
	'use strict';
	var foo, bar;
	return {
		setters: [function (module) {
			foo = module;
		}, function (module) {
			bar = module;
		}],
		execute: function () {

			foo.x();
			console.log(bar);

		}
	};
});
