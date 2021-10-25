define(['exports'], (function (exports) { 'use strict';

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

	var dep = { foo: 1 };
	const bar = 2;

	var dep$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
		__proto__: null,
		'default': dep,
		bar: bar
	}, [dep]));

	exports.dep = dep$1;

}));
