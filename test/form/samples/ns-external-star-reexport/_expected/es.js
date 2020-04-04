import * as external1 from 'external1';
import * as external2 from 'external2';

var reexportExternal = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), external1));

const extra = 'extra';

const override = 'override';
var reexportExternalsWithOverride = { synthetic: 'synthetic' };

var reexportExternalsWithOverride$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), external1, external2, {
	override: override,
	'default': reexportExternalsWithOverride,
	extra: extra
}, reexportExternalsWithOverride));

export { reexportExternal as external, reexportExternalsWithOverride$1 as externalOverride };
