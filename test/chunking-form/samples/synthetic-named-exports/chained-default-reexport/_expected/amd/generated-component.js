define(['exports', './generated-main'], (function (exports, main) { 'use strict';

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

	var component = { lib: main.lib, lib2: main.lib.named, lib3: main.lib.named.named };

	var component$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
		__proto__: null,
		'default': component
	}, [component]));

	exports.component = component$1;

}));
