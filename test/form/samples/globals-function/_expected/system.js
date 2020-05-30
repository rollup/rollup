System.register('myBundle', ['a', 'b'], function () {
	'use strict';
	var a, b;
	return {
		setters: [function (module) {
			a = module.default;
		}, function (module) {
			b = module.default;
		}],
		execute: function () {

			console.log(a, b);

		}
	};
});
