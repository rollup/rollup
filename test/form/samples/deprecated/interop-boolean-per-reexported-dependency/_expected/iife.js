var bundle = (function (exports, externalFalse, externalTrue) {
	'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

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

	var externalTrue__namespace = /*#__PURE__*/_interopNamespace(externalTrue);
	var externalTrue__default = /*#__PURE__*/_interopDefaultLegacy(externalTrue);



	Object.defineProperty(exports, 'barFalse', {
		enumerable: true,
		get: function () {
			return externalFalse.barFalse;
		}
	});
	exports.externalFalse = externalFalse;
	exports.fooFalse = externalFalse;
	Object.defineProperty(exports, 'barTrue', {
		enumerable: true,
		get: function () {
			return externalTrue.barTrue;
		}
	});
	exports.externalTrue = externalTrue__namespace;
	Object.defineProperty(exports, 'fooTrue', {
		enumerable: true,
		get: function () {
			return externalTrue__default['default'];
		}
	});

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

}({}, externalfalse, externaltrue));
