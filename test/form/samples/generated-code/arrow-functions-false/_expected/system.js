System.register('bundle', ['externalNoImport', 'external', 'externalAuto', 'externalDefault', 'externalDefaultOnly'], (function (exports, module) {
	'use strict';
	var _starExcludes = {
		__proto__: null,
		a: 1,
		default: 1,
		foo: 1
	};
	var b, defaultCompat, defaultCompat__default, externalAuto, externalDefault, externalDefaultOnly;
	return {
		setters: [function () {}, function (module) {
			b = module.b;
			defaultCompat = module;
			defaultCompat__default = module.default;
			var setter = { __proto__: null, foo: module.foo };
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}, function (module) {
			externalAuto = module.default;
		}, function (module) {
			externalDefault = module;
		}, function (module) {
			externalDefaultOnly = module;
		}],
		execute: (function () {

			function _mergeNamespaces(n, m) {
				m.forEach(function (e) {
					e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
						if (k !== 'default' && !(k in n)) {
							var d = Object.getOwnPropertyDescriptor(e, k);
							Object.defineProperty(n, k, d.get ? d : {
								enumerable: true,
								get: function () { return e[k]; }
							});
						}
					});
				});
				return Object.freeze(n);
			}

			let a; exports("a", a);

			(function (v) { return exports("a", a), v; })({ a } = b);
			console.log(function (v) { return exports("a", a), v; }({ a } = b));

			Promise.resolve().then(function () { return main; }).then(console.log);

			module.import('external').then(console.log);
			console.log(defaultCompat__default);
			console.log(externalAuto);
			console.log(externalDefault);
			console.log(externalDefaultOnly);

			var main = /*#__PURE__*/_mergeNamespaces({
				__proto__: null,
				get a () { return a; },
				foo: foo
			}, [defaultCompat]);

		})
	};
}));
