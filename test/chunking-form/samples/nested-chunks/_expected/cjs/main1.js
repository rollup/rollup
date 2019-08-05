'use strict';

function _interopNamespace(e) {
	if (e && e.__esModule) { return e; } else {
		var n = {};
		if (e) {
			Object.keys(e).forEach(function (k) {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () {
						return e[k];
					}
				});
			});
		}
		n['default'] = e;
		return n;
	}
}

var dep = require('./generated-chunk.js');

console.log('main1', dep.value);

new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); }).then(result => console.log(result));
new Promise(function (resolve) { resolve(_interopNamespace(require('./external.js'))); }).then(result => console.log(result));
