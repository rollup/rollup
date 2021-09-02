System.register('bundle', ['externalNoImport', 'external', 'externalAuto', 'externalDefault', 'externalDefaultOnly'], (function (exports, module) {
	'use strict';
	var _starExcludes = { a: 1, 'default': 1, foo: 1 };
	var b, defaultLegacy, defaultLegacy__default, externalAuto, externalDefault, externalDefaultOnly;
	return {
		setters: [function () {}, function (module) {
			b = module.b;
			defaultLegacy = module;
			defaultLegacy__default = module["default"];
			var setter = { foo: module.foo };
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}, function (module) {
			externalAuto = module["default"];
		}, function (module) {
			externalDefault = module;
		}, function (module) {
			externalDefaultOnly = module;
		}],
		execute: (function () {

			let a; exports('a', a);

			(function (v) { return exports('a', a), v; })({ a } = b);
			console.log(function (v) { return exports('a', a), v; }({ a } = b));

			Promise.resolve().then(function () { return main; }).then(console.log);

			module.import('external').then(console.log);
			console.log(defaultLegacy__default);
			console.log(externalAuto);
			console.log(externalDefault);
			console.log(externalDefaultOnly);

			var main = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), defaultLegacy, {
				get a () { return a; },
				foo: foo
			}));

		})
	};
}));
