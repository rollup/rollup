System.register(['./generated-lib1.js'], (function (exports, module) {
	'use strict';
	var value1, value1$1, value2;
	return {
		setters: [function (module) {
			value1 = module.value1;
			value1$1 = module.v;
			value2 = module.a;
		}],
		execute: (function () {

			console.log(value1);
			console.log(value1$1);
			console.log(value2);
			console.log(module.import('./generated-lib1.js').then(function (n) { return n.l; }).then(m => m.value3));

		})
	};
}));
