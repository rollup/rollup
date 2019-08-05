System.register(['./generated-main2.js'], function () {
	'use strict';
	var a, main2;
	return {
		setters: [function (module) {
			a = module.a;
			main2 = module.m;
		}],
		execute: function () {

			console.log(a);

			console.log(main2);

		}
	};
});
