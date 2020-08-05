'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var highcharts = require('highcharts');

function _interopNamespace(e) {
	if (e && e.__esModule) { return e; } else {
		var n = Object.create(null);
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
		return Object.freeze(n);
	}
}

var highcharts__namespace = /*#__PURE__*/_interopNamespace(highcharts);



exports.Highcharts = highcharts__namespace;
