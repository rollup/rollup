(function (externalAuto, externalDefault, externalDefaultOnly) {
	'use strict';

	function _interopNamespaceDefaultOnly (e) { return Object.freeze(Object.defineProperty({ __proto__: null, 'default': e }, Symbol.toStringTag, { value: 'Module' })); }

	function _interopNamespaceDefault(e) {
		var n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
		if (e) {
			Object.keys(e).forEach(function (k) {
				if (k !== 'default') {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () { return e[k]; }
					});
				}
			});
		}
		n["default"] = e;
		return Object.freeze(n);
	}

	function _interopNamespace (e) { return e && e.__esModule ? e : _interopNamespaceDefault(e); }

	var externalAuto__namespace = /*#__PURE__*/_interopNamespace(externalAuto);
	var externalDefault__namespace = /*#__PURE__*/_interopNamespaceDefault(externalDefault);
	var externalDefaultOnly__namespace = /*#__PURE__*/_interopNamespaceDefaultOnly(externalDefaultOnly);

	assert.strictEqual(externalAuto__namespace[Symbol.toStringTag], 'Module');
	assert.strictEqual(Object.prototype.toString.call(externalAuto__namespace), '[object Module]');
	assert.strictEqual(externalAuto__namespace.foo, 42);

	assert.strictEqual(externalDefault__namespace[Symbol.toStringTag], 'Module');
	assert.strictEqual(Object.prototype.toString.call(externalDefault__namespace), '[object Module]');
	assert.strictEqual(externalDefault__namespace.foo, 42);

	assert.strictEqual(externalDefaultOnly__namespace[Symbol.toStringTag], 'Module');
	assert.strictEqual(Object.prototype.toString.call(externalDefaultOnly__namespace), '[object Module]');
	assert.deepStrictEqual(externalDefaultOnly__namespace.default, { foo: 42 });

})(externalAuto, externalDefault, externalDefaultOnly);
