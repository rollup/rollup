define(['require'], (function (require) { 'use strict';

	function _interopNamespaceDefaultOnly (e) { return Object.freeze(/*#__PURE__*/Object.setPrototypeOf({ default: e }, null)); }

	new Promise(function (resolve, reject) { require(['./main'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject); }).then(result => console.log('importer', result));

}));
