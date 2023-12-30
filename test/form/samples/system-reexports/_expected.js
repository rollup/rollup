System.register(['external1', 'external2', 'external3', 'external4', 'external5'], (function (exports) {
	'use strict';
	var _starExcludes = {
		__proto__: null,
		default: 1,
		namedReexport1: 1,
		namedReexport2a: 1,
		namedReexport2b: 1,
		namespaceReexport3: 1,
		namedReexport5: 1,
		namespaceReexport5: 1
	};
	return {
		setters: [function (module) {
			exports("namedReexport1", module.namedReexport1);
		}, function (module) {
			exports({ namedReexport2a: module.namedReexport2a, namedReexport2b: module.default });
		}, function (module) {
			exports("namespaceReexport3", module);
		}, function (module) {
			var setter = { __proto__: null };
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}, function (module) {
			var setter = { __proto__: null, namedReexport5: module.namedReexport5, namespaceReexport5: module };
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}],
		execute: (function () {



		})
	};
}));
