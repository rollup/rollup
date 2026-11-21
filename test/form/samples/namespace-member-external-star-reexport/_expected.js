import * as external from 'external';

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

var direct = /*#__PURE__*/_mergeNamespaces({
	__proto__: null
}, [external]);

var transitive = /*#__PURE__*/_mergeNamespaces({
	__proto__: null
}, [external]);

console.log(direct.existing, direct.missing, transitive.existing, transitive.missing);
