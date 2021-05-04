System.register('bundle', ['external'], function (exports) {
	'use strict';
	var _starExcludes = { renamedIndirectOverride: 1, default: 1, renamedDirectOverride: 1 };
	var indirectOverride;
	return {
		setters: [function (module) {
			indirectOverride = module.indirectOverride;
			var _setter = {};
			for (var _$p in module) {
				if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];
			}
			_setter.renamedDirectOverride = module.directOverride;
			exports(_setter);
		}],
		execute: function () {

			const renamedIndirectOverride = exports('renamedIndirectOverride', indirectOverride);

		}
	};
});
