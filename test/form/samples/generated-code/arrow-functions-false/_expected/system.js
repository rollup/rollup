System.register('bundle', ['external', 'externalAuto', 'externalDefault', 'externalDefaultOnly'], (function (exports, module) {
	'use strict';
	var _starExcludes = { a: 1, 'default': 1, foo: 1 };
	var b, defaultLegacy__default, externalAuto, externalDefault, externalDefaultOnly;
	return {
		setters: [(function (module) {
			b = module.b;
			defaultLegacy__default = module["default"];
			var setter = { foo: module.foo };
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}), (function (module) {
			externalAuto = module["default"];
		}), (function (module) {
			externalDefault = module;
		}), (function (module) {
			externalDefaultOnly = module;
		})],
		execute: (function () {

			let a; exports('a', a);

			(function (v) { return exports('a', a), v; })({ a } = b);
			console.log(function (v) { return exports('a', a), v; }({ a } = b));

			module.import('external').then(console.log);
			console.log(defaultLegacy__default);
			console.log(externalAuto);
			console.log(externalDefault);
			console.log(externalDefaultOnly);

		})
	};
}));
