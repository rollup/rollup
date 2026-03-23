System.register(['./generated-dep.js', 'starexternal2', 'external2'], (function (exports) {
	'use strict';
	var _starExcludes = /*#__PURE__*/Object.setPrototypeOf({
		main: 1,
		default: 1,
		dep: 1,
		e: 1
	}, null);
	return {
		setters: [function (module) {
			exports("dep", module.d);
		}, function (module) {
			var setter = /*#__PURE__*/Object.setPrototypeOf({}, null);
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}, function (module) {
			exports("e", module.e);
		}],
		execute: (function () {

			var main = exports("main", '2');

		})
	};
}));
