var bundle = (function (exports, foo$1) {
	'use strict';

	var _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { default: e };

	function _interopNamespace(e) {
		if (e && e.__esModule) return e;
		var n = Object.create(null);
		if (e) {
			Object.keys(e).forEach(k => {
				if (k !== 'default') {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: () => e[k]
					});
				}
			});
		}
		n.default = e;
		return Object.freeze(n);
	}

	var foo__default = /*#__PURE__*/_interopDefaultLegacy(foo$1);
	var foo__namespace = /*#__PURE__*/_interopNamespace(foo$1);

	var _missingExportShim = void 0;

	const foo = 'bar';

	var other = /*#__PURE__*/Object.freeze({
		__proto__: null,
		foo: foo,
		missing: _missingExportShim
	});

	var synthetic = { bar: 'baz' };

	console.log(foo__default.default, foo__namespace, other, bar, _missingExportShim);
	var main = 42;

	exports.default = main;
	exports.syntheticMissing = synthetic.syntheticMissing;
	Object.keys(foo$1).forEach(k => {
		if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: () => foo$1[k]
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, foo$1);
