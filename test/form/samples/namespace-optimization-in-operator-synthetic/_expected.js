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

const __moduleExports = { a: true };

var mod = /*#__PURE__*/_mergeNamespaces({
	__proto__: null
}, [__moduleExports]);

if ('a' in mod) console.log(`'a' in mod`);
if ('b' in mod) console.log(`'b' in mod`);
