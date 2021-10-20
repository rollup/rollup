import * as external1 from 'external1';
import * as external2 from 'external2';

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

var reexportExternal = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
	__proto__: null
}, [external1]));

const extra = 'extra';

const override = 'override';
var reexportExternalsWithOverride = { synthetic: 'synthetic' };

var reexportExternalsWithOverride$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
	__proto__: null,
	override: override,
	'default': reexportExternalsWithOverride,
	extra: extra
}, [reexportExternalsWithOverride, external1, external2]));

export { reexportExternal as external, reexportExternalsWithOverride$1 as externalOverride };
