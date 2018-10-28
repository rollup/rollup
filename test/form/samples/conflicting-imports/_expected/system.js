System.register(['foo', 'bar'], function (exports, module) {
	'use strict';
	var a$1, a;
	return {
		setters: [function (module) {
			a$1 = module.a;
		}, function (module) {
			a = module.a;
		}],
		execute: function () {

			console.log( a );

			console.log( a$1 );

		}
	};
});
