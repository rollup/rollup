System.register(['./chunk2.js', './chunk1.js'], function (exports, module) {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			
		}, function (module) {
			foo = module.default;
		}],
		execute: function () {

			exports('default', foo);

		}
	};
});
