var bundle = (function (exports, foo$1) {
	'use strict';

	function _interopNamespaceCompat(e) {
		if (e && typeof e === 'object' && 'default' in e) return e;
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

	var foo__namespace = /*#__PURE__*/_interopNamespaceCompat(foo$1);

	var _missingExportShim = void 0;

	const foo = 'bar';

	var other = /*#__PURE__*/Object.freeze({
		__proto__: null,
		foo: foo,
		missing: _missingExportShim
	});

	var synthetic = { bar: 'baz' };

	console.log(foo__namespace.default, foo__namespace, other, bar, _missingExportShim);
	var main = 42;

	exports.default = main;
	exports.syntheticMissing = synthetic.syntheticMissing;
	Object.keys(foo$1).forEach(k => {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: () => foo$1[k]
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, external);
