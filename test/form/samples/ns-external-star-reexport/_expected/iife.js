var bundle = (function (exports, external1, external2) {
	'use strict';

	function _interopNamespace(e) {
		if (e && e.__esModule) { return e; } else {
			var n = Object.create(null);
			if (e) {
				Object.keys(e).forEach(function (k) {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () {
							return e[k];
						}
					});
				});
			}
			n['default'] = e;
			return Object.freeze(n);
		}
	}

	var external1__ns = /*#__PURE__*/_interopNamespace(external1);
	var external2__ns = /*#__PURE__*/_interopNamespace(external2);

	var reexportExternal = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), external1__ns));

	const extra = 'extra';

	const override = 'override';
	var reexportExternalsWithOverride = { synthetic: 'synthetic' };

	var reexportExternalsWithOverride$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), external1__ns, external2__ns, reexportExternalsWithOverride, {
		override: override,
		'default': reexportExternalsWithOverride,
		extra: extra
	}));

	exports.external = reexportExternal;
	exports.externalOverride = reexportExternalsWithOverride$1;

	return exports;

}({}, external1, external2));
