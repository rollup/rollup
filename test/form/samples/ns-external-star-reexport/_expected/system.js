System.register('bundle', ['external1', 'external2'], function (exports) {
	'use strict';
	var external1, external2;
	return {
		setters: [function (module) {
			external1 = module;
		}, function (module) {
			external2 = module;
		}],
		execute: function () {

			var reexportExternal = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), external1), '__esModule', { value: true }));
			exports('external', reexportExternal);

			const extra = 'extra';

			const override = 'override';
			var reexportExternalsWithOverride = { synthetic: 'synthetic' };

			var reexportExternalsWithOverride$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), external1, external2, reexportExternalsWithOverride, {
				override: override,
				'default': reexportExternalsWithOverride,
				extra: extra
			}), '__esModule', { value: true }));
			exports('externalOverride', reexportExternalsWithOverride$1);

		}
	};
});
