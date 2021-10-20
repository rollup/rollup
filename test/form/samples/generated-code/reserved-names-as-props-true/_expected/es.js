import { function as function$1 } from 'external';
import * as external from 'external';
export { external as default };
export { function as bar, default as void } from 'external';
import * as defaultOnly from 'externalDefaultOnly';
import someDefault from 'external2';

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

var other = {
	foo: 'bar'
};

var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
	__proto__: null,
	default: other
}, [other]));

console.log(ns, other.foo, other.function, other["some-prop"], function$1, someDefault, defaultOnly);
console.log(import.meta['function'], import.meta['some-prop']);

let f = 1;
f++;

export { f as function };
