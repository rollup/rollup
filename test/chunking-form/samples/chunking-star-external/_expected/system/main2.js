System.register(['./generated-dep.js', 'external2', 'starexternal2'], function (exports) {
	'use strict';
	var _starExcludes = { main: 1, default: 1, dep: 1, e: 1 };
	return {
		setters: [function (module) {
			exports('dep', module.d);
		}, function (module) {
			exports('e', module.e);
		}, function (module) {
			var _setter = {};
			for (var _$p in module) {
				if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];
			}
			exports(_setter);
		}],
		execute: function () {

			var main = exports('main', '2');

		}
	};
});
