define(['require', 'exports', 'external'], ((require, exports, external) => { 'use strict';

	function _interopNamespace(e) {
		if (e && e.__esModule) return e;
		var n = Object.create(null);
		if (e) {
			Object.keys(e).forEach(function (k) {
				if (k !== 'default') {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () {
							return e[k];
						}
					});
				}
			});
		}
		n['default'] = e;
		return Object.freeze(n);
	}

	exports.a = void 0;

	({a: exports.a} = external.b);
	console.log({a: exports.a} = external.b);

	new Promise((resolve, reject) => require(['external'], m => resolve(/*#__PURE__*/_interopNamespace(m)), reject)).then(console.log);

	Object.defineProperty(exports, 'foo', {
		enumerable: true,
		get: () => external.foo
	});
	Object.keys(external).forEach(k => {
		if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: () => external[k]
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

}));
