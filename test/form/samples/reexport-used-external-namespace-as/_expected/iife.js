var bundle = (function (exports, imported1, external2) {
	'use strict';

	function _interopNamespace(e) {
		if (e && e.__esModule) { return e; } else {
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
	}

	var imported1__namespace = /*#__PURE__*/_interopNamespace(imported1);
	var external2__namespace = /*#__PURE__*/_interopNamespace(external2);

	console.log(imported1__namespace, external2.imported2);

	exports.external1 = imported1__namespace;
	exports.external2 = external2__namespace;

	return exports;

}({}, external1, external2));
