var bundle = (function (exports, external1, external2) {
	'use strict';

	var reexportExternal = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), external1));

	const extra = 'extra';

	const override = 'override';
	var reexportExternalsWithOverride = { synthetic: 'synthetic' };

	var reexportExternalsWithOverride$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), external1, external2, reexportExternalsWithOverride, {
		override: override,
		'default': reexportExternalsWithOverride,
		extra: extra
	}));

	exports.external = reexportExternal;
	exports.externalOverride = reexportExternalsWithOverride$1;

	return exports;

}({}, external1, external2));
