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

var external__namespace = /*#__PURE__*/_interopNamespaceDefault(external);

console.log(external.finally, external.catch); // retain those local bindings

const legal = 10;

Object.defineProperty(exports, 'const', {
	enumerable: true,
	get: function () { return external.const; }
});
Object.defineProperty(exports, 'in', {
	enumerable: true,
	get: function () { return external.for; }
});
Object.defineProperty(exports, 'return', {
	enumerable: true,
	get: function () { return external.bar; }
});
exports.yield = external__namespace;
exports.await = legal;
