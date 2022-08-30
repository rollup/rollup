'use strict';

var foo = require('https://unpkg.com/foo');

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

assert.equal(foo, 42);

Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefault(require('https://unpkg.com/foo')); }).then(({ default: foo }) => assert.equal(foo, 42));
