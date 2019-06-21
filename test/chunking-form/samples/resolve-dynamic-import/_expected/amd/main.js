define(['require', './generated-existing', './direct-relative-external', 'to-indirect-relative-external', 'direct-absolute-external', 'to-indirect-absolute-external'], function (require, existing, directRelativeExternal, toIndirectRelativeExternal, directAbsoluteExternal, toIndirectAbsoluteExternal) { 'use strict';

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

	// nested
	new Promise(function (resolve, reject) { require(['./generated-existing'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['./direct-relative-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['to-indirect-relative-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['direct-absolute-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['to-indirect-absolute-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });

	//main
	new Promise(function (resolve, reject) { require(['./generated-existing'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['./direct-relative-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['to-indirect-relative-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['direct-absolute-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['to-indirect-absolute-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });

	new Promise(function (resolve, reject) { require(['dynamic-direct-external' + unknown], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['to-dynamic-indirect-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['./generated-existing'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['my' + 'replacement'], function (m) { resolve(_interopNamespace(m)); }, reject) });

});
