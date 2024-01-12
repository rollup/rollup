System.register('bundle', ['external'], (function (exports) {
	'use strict';
	var _starExcludes = {
		__proto__: null,
		renamedIndirectOverride: 1,
		default: 1,
		renamedDirectOverride: 1
	};
	var indirectOverride;
	return {
		setters: [function (module) {
			indirectOverride = module.indirectOverride;
			var setter = { __proto__: null, renamedDirectOverride: module.directOverride };
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}],
		execute: (function () {

			const renamedIndirectOverride = exports("renamedIndirectOverride", indirectOverride);

		})
	};
}));
