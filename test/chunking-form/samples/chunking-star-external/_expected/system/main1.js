System.register(['starexternal1', 'external1', './generated-dep.js', 'starexternal2', 'external2'], (function (exports) {
	'use strict';
	var _starExcludes = {
		main: 1,
		default: 1,
		e: 1,
		dep: 1
	};
	return {
		setters: [function (module) {
			var setter = {};
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}, function (module) {
			exports('e', module.e);
		}, function (module) {
			exports('dep', module.d);
		}, null, null],
		execute: (function () {

			var main = exports("main", '1');

		})
	};
}));
