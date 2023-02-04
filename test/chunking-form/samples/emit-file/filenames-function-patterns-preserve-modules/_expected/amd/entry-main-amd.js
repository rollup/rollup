define(['require'], (function (require) { 'use strict';

	function _interopNamespaceDefaultOnly (e) { return Object.freeze({ __proto__: null, default: e }); }

	console.log('main');
	new Promise(function (resolve, reject) { require(['./entry-deb-amd'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject); }).then(console.log);

}));
