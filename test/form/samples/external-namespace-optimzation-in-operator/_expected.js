import * as nc from 'node:crypto';
import * as ext from './ext.js';

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

var pt = /*#__PURE__*/_mergeNamespaces({
	__proto__: null
}, [ext]);

const crypto = 'webcrypto' in nc;
const direct = 'whatever' in ext;
const indirect = 'whatever' in pt;

export { crypto, direct, indirect };
