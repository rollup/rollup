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

			var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), externalNs1, externalNs2, {
				val: val
			}));

			exports('default', ns);

		}
	};
});
