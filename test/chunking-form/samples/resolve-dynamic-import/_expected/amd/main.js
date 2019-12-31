define(['require', './direct-relative-external', 'to-indirect-relative-external', 'direct-absolute-external', 'to-indirect-absolute-external'], function (require, directRelativeExternal, toIndirectRelativeExternal, directAbsoluteExternal, toIndirectAbsoluteExternal) { 'use strict';

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
	Promise.resolve().then(function () { return existing; });
	new Promise(function (resolve, reject) { require(['./direct-relative-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['to-indirect-relative-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['direct-absolute-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['to-indirect-absolute-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });

	const value = 'existing';

	var existing = /*#__PURE__*/Object.freeze({
		__proto__: null,
		value: value
	});

	//main
	Promise.resolve().then(function () { return existing; });
	new Promise(function (resolve, reject) { require(['./direct-relative-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['to-indirect-relative-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['direct-absolute-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['to-indirect-absolute-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });

	new Promise(function (resolve, reject) { require(['dynamic-direct-external' + unknown], function (m) { resolve(_interopNamespace(m)); }, reject) });
	new Promise(function (resolve, reject) { require(['to-dynamic-indirect-external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	Promise.resolve().then(function () { return existing; });
	new Promise(function (resolve, reject) { require(['my' + 'replacement'], function (m) { resolve(_interopNamespace(m)); }, reject) });

});
