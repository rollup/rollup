define(['require', 'external'], function (require, external) { 'use strict';

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

	new Promise(function (resolve, reject) { require([external.join('a', 'b')], function (m) { resolve(_interopNamespace(m)); }, reject) });
	console.log(external.join);

});
