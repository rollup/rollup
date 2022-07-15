define(['require'], (function (require) { 'use strict';

	function _interopNamespaceDefaultOnly (e) { return Object.freeze(Object.defineProperty({ __proto__: null, default: e }, Symbol.toStringTag, { value: 'Module' })); }

	new Promise(function (resolve, reject) { require(['./foo'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject); }).then(console.log);

}));
