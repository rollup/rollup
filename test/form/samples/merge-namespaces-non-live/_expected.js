import * as external1 from 'external1';
import * as external2 from 'external2';

function _mergeNamespaces(n, m) {
	m.forEach(function (e) { Object.keys(e).forEach(function (k) {
		if (k !== 'default' && !(k in n)) {
			n[k] = e[k];
		}
	}); });
	return Object.freeze(n);
}

const __synthetic = { foo: 'foo' };

var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
	__proto__: null
}, [__synthetic, external1, external2]));

console.log(ns);
