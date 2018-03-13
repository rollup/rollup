System.register(['./chunk1.js'], function (exports, module) {
	'use strict';
	var main2, a, b;
	return {
		setters: [function (module) {
			main2 = module.main2;
			a = module.a;
			b = module.b;
		}],
		execute: function () {

			console.log(a);

			console.log(main2);

		}
	};
});
