System.register(['./chunk-2cdd1e7c.js', './chunk-bd4e83f2.js'], function (exports, module) {
	'use strict';
	var foo;
	return {
		setters: [function () {}, function (module) {
			foo = module.a;
		}],
		execute: function () {

			exports('default', foo);

		}
	};
});
