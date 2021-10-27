import { l as lib } from './generated-main.js';

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

var component = { lib, lib2: lib.named, lib3: lib.named.named };

var component$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
	__proto__: null,
	'default': component
}, [component]));

export { component$1 as c };
