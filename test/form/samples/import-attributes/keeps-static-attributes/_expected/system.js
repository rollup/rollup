System.register('bundle', ['a', 'b', 'c', 'd', 'unresolved'], (function (exports) {
	'use strict';
	var _starExcludes = /*#__PURE__*/Object.setPrototypeOf({
		default: 1,
		c: 1
	}, null);
	var a, b;
	return {
		setters: [function (module) {
			a = module.a;
		}, function (module) {
			b = module;
		}, function (module) {
			exports("c", module.c);
		}, function (module) {
			var setter = /*#__PURE__*/Object.setPrototypeOf({}, null);
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
