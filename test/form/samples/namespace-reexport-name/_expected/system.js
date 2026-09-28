System.register('bundle', ['external'], (function (exports) {
	'use strict';
	var _starExcludes = /*#__PURE__*/Object.setPrototypeOf({
		renamedIndirectOverride: 1,
		default: 1,
		renamedDirectOverride: 1
	}, null);
	var indirectOverride;
	return {
		setters: [function (module) {
			indirectOverride = module.indirectOverride;
			var setter = /*#__PURE__*/Object.setPrototypeOf({ renamedDirectOverride: module.directOverride }, null);
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
