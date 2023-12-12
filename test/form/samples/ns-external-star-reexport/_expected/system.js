System.register('bundle', ['external1', 'external2'], (function (exports) {
	'use strict';
	var external1, external2;
	return {
		setters: [function (module) {
			external1 = module;
		}, function (module) {
			external2 = module;
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

			var reexportExternal = /*#__PURE__*/_mergeNamespaces({
				__proto__: null
			}, [external1]);
			exports("external", reexportExternal);

			const extra = 'extra';

			const override = 'override';
			var reexportExternalsWithOverride = { synthetic: 'synthetic' };

			var reexportExternalsWithOverride$1 = /*#__PURE__*/_mergeNamespaces({
				__proto__: null,
				default: reexportExternalsWithOverride,
				extra: extra,
				override: override
			}, [reexportExternalsWithOverride, external1, external2]);
			exports("externalOverride", reexportExternalsWithOverride$1);

		})
	};
}));
