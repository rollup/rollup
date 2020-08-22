System.register(['./generated-geometry.js'], function () {
	'use strict';
	var foo, bar;
	return {
		setters: [function (module) {
			foo = module.f;
			bar = module.b;
		}],
		execute: function () {

			console.log(foo, bar);

		}
	};
});
