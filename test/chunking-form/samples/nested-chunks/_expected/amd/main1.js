define(['require', './generated-chunk'], function (require, dep) { 'use strict';

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

	console.log('main1', dep.value);

	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) }).then(result => console.log(result));
	new Promise(function (resolve, reject) { require(['./external'], function (m) { resolve(_interopNamespace(m)); }, reject) }).then(result => console.log(result));

});
