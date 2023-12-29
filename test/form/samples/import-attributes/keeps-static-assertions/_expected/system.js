System.register('bundle', ['a', 'b', 'c', 'd', 'unresolved'], (function (exports) {
	'use strict';
	var _starExcludes = {
		__proto__: null,
		default: 1,
		c: 1
	};
	var a, b;
	return {
		setters: [function (module) {
			a = module.a;
		}, function (module) {
			b = module;
		}, function (module) {
			exports("c", module.c);
		}, function (module) {
			var setter = { __proto__: null };
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}, null],
		execute: (function () {

			console.log(a, b, d);

		})
	};
}));
