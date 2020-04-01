System.register(['external-ns-1', 'external-ns-2'], function (exports) {
	'use strict';
	var externalNs1, externalNs2;
	return {
		setters: [function (module) {
			externalNs1 = module;
		}, function (module) {
			externalNs2 = module;
		}],
		execute: function () {

			const val = 5;

			var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(externalNs1, externalNs2, {
				__proto__: null,
				val: val
			}));

			exports('default', ns);

		}
	};
});
