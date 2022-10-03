System.register('bundle', ['a', 'b', 'c'], (function (exports, module) {
	'use strict';
	var a, b;
	return {
		setters: [function (module) {
			a = module.a;
		}, function (module) {
			b = module.b;
		}, function (module) {
			exports('c', module.c);
		}],
		execute: (function () {

			console.log(a, b);

			module.import('d').then(console.log);

		})
	};
}));
