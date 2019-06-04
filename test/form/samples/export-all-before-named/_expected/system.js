System.register(['path'], function (exports) {
	'use strict';
	var _starExcludes = { default: 1, isRelative: 1 };
	return {
		setters: [function (module) {
			var _setter = {};
			for (var _$p in module) {
				if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];
			}
			_setter.isRelative = module.isRelative;
			exports(_setter);
		}],
		execute: function () {



		}
	};
});
