'use strict';

var foo = require('https://unpkg.com/foo');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

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

var foo__default = /*#__PURE__*/_interopDefaultLegacy(foo);

assert.equal(foo__default['default'], 42);

Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('https://unpkg.com/foo')); }).then(({ default: foo }) => assert.equal(foo, 42));
