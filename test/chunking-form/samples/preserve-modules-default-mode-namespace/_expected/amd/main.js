define(['require', 'exports', './lib'], (function (require, exports, lib) { 'use strict';

	function _interopNamespaceDefaultOnly (e) { return Object.freeze({ __proto__: null, default: e }); }

	var lib__namespace = /*#__PURE__*/_interopNamespaceDefaultOnly(lib);

	console.log(lib__namespace);
	new Promise(function (resolve, reject) { require(['./lib'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject); }).then(console.log);

	exports.lib = lib__namespace;

}));
