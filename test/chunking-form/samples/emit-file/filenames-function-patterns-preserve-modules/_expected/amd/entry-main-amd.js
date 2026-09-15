define(['require'], (function (require) { 'use strict';

	function _interopNamespaceDefaultOnly (e) { return Object.freeze(/*#__PURE__*/Object.setPrototypeOf({ default: e }, null)); }

	console.log('main');
	new Promise(function (resolve, reject) { require(['./entry-deb-amd'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject); }).then(console.log);

}));
