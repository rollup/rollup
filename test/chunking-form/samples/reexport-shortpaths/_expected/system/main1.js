System.register(['./chunk-bd4e83f2.js'], function (exports, module) {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			foo = module.a;
		}],
		execute: function () {

			exports('default', foo);

		}
	};
});
