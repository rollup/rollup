define(['exports', 'external'], (function (exports, foo$1) { 'use strict';

	const _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { 'default': e };

	function _interopNamespace(e) {
		if (e && e.__esModule) return e;
		const n = Object.create(null);
		if (e) {
			for (const k in e) {
				if (k !== 'default') {
					const d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: () => e[k]
					});
				}
			}
		}
		n["default"] = e;
		return Object.freeze(n);
	}

	const foo__default = /*#__PURE__*/_interopDefaultLegacy(foo$1);
	const foo__namespace = /*#__PURE__*/_interopNamespace(foo$1);

	const _missingExportShim = void 0;

	const foo = 'bar';

	const other = /*#__PURE__*/Object.freeze({
		__proto__: null,
		foo: foo,
		missing: _missingExportShim
	});

	const synthetic = { bar: 'baz' };

	console.log(foo__default["default"], foo__namespace, other, bar, _missingExportShim);
	const main = 42;

	exports["default"] = main;
	exports.syntheticMissing = synthetic.syntheticMissing;
	for (const k in foo$1) {
		if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: () => foo$1[k]
		});
	}

	Object.defineProperty(exports, '__esModule', { value: true });

}));
