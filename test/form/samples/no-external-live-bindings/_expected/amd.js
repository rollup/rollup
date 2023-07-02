define(['require', 'exports', 'external1', 'external2'], (function (require, exports, external1, external2) { 'use strict';

	function _interopNamespaceDefault(e) {
		var n = Object.create(null);
		if (e) {
			for (var k in e) {
				n[k] = e[k];
			}
		}
		n.default = e;
		return Object.freeze(n);
	}

	const dynamic = new Promise(function (resolve, reject) { require(['external3'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefault(m)); }, reject); });

	exports.external1 = external1.external1;
	exports.dynamic = dynamic;
	Object.keys(external2).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = external2[k];
	});

}));
