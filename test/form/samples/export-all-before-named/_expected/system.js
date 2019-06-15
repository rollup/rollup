System.register('exposedInternals', ['external'], function (exports) {
	'use strict';
	var _starExcludes = { internalFn: 1, default: 1 };
	return {
		setters: [function (module) {
			var _setter = {};
			for (var _$p in module) {
				if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];
			}
			exports(_setter);
		}],
		execute: function () {

			exports('internalFn', internalFn);

			function internalFn(path) {
				return path[0] === '.';
			}

		}
	};
});
