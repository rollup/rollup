'use strict';

var external = require('external');

function _interopNamespaceDefault(e) {
	var n = Object.create(null);
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
	n.default = e;
	return Object.freeze(n);
}

(function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefault(require(t)); }); })(external.join('a', 'b'));
console.log(external.join);
