System.register(['foo'], function (exports, module) {
	'use strict';
	var foo__default, bar;
	return {
		setters: [function (module) {
			foo__default = module.default;
			bar = module.bar;
		}],
		execute: function () {

			console.log( bar );

			console.log( foo__default );

		}
	};
});
