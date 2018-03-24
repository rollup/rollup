System.register(['./chunk-a87fa548.js', './chunk-aa2ad1a6.js'], function (exports, module) {
	'use strict';
	var foo;
	return {
		setters: [function () {}, function (module) {
			foo = module.default;
		}],
		execute: function () {

			exports('default', foo);

		}
	};
});
