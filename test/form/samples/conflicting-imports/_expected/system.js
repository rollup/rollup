System.register(['bar', 'foo'], function (exports, module) {
	'use strict';
	var a, a$1;
	return {
		setters: [function (module) {
			a = module.a;
		}, function (module) {
			a$1 = module.a;
		}],
		execute: function () {

			console.log( a );

			console.log( a$1 );

		}
	};
});
