define(['require'], function (require) { 'use strict';

	function _interopNamespaceDefaultOnly(e) {
		return Object.freeze({__proto__: null, 'default': e});
	}

	var main = Promise.all([new Promise(function (resolve, reject) { require(['./entry'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject) }), new Promise(function (resolve, reject) { require(['./generated-other'], resolve, reject) })]);

	return main;

});
