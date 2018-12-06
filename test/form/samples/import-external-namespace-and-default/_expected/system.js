System.register(['foo'], function (exports, module) {
	'use strict';
	var bar, foo__default;
	return {
		setters: [function (module) {
			bar = module.bar;
			foo__default = module.default;
		}],
		execute: function () {

			console.log( bar );

			console.log( foo__default );

		}
	};
});
