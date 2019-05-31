System.register(['foo', 'bar'], function () {
	'use strict';
	var x, bar;
	return {
		setters: [function (module) {
			x = module.x;
		}, function (module) {
			bar = module;
		}],
		execute: function () {

			x();
			console.log(bar);

		}
	};
});
