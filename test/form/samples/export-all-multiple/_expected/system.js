System.register('myBundle', ['foo', 'bar', 'baz'], function (exports) {
	'use strict';
	var _starExcludes = { default: 1 };
	return {
		setters: [function (module) {
			var _setter = {};
			for (var _$p in module) {
				if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];
			}
			exports(_setter);
		}, function (module) {
			var _setter = {};
			for (var _$p in module) {
				if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];
			}
			exports(_setter);
		}, function (module) {
			var _setter = {};
			for (var _$p in module) {
				if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];
			}
			exports(_setter);
		}],
		execute: function () {



		}
	};
});
