System.register(['./generated-dynamic.js'], (function () {
	'use strict';
	var dynamic, dep;
	return {
		setters: [function (module) {
			dynamic = module.a;
			dep = module.d;
		}],
		execute: (function () {

			console.log('main2', dynamic, dep);

		})
	};
}));
