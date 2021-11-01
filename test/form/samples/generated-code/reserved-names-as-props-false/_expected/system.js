System.register('bundle', ['external', 'externalDefaultOnly', 'external2'], (function (exports, module) {
	'use strict';
	var function$1, defaultOnly, someDefault;
	return {
		setters: [function (module) {
			function$1 = module["function"];
			exports({ bar: module["function"], 'default': module, 'void': module["default"] });
		}, function (module) {
			defaultOnly = module;
		}, function (module) {
			someDefault = module["default"];
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

			var other = {
				foo: 'bar'
			};

			var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
				__proto__: null,
				'default': other
			}, [other]));

			console.log(ns, other.foo, other["function"], other["some-prop"], function$1, someDefault, defaultOnly);
			console.log(module.meta["function"], module.meta["some-prop"]);

			let f = exports('function', 1);
			exports('function', f + 1), f++;

		})
	};
}));
