System.register(['./dep2.js'], function (exports, module) {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			foo = module.default;
		}],
		execute: function () {

			exports('default', foo);

		}
	};
});
