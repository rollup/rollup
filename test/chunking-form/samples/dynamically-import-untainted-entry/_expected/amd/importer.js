define(['require'], function (require) { 'use strict';

	function _interopNamespaceDefaultOnly(e) {
		return Object.freeze(Object.defineProperty({__proto__: null, 'default': e}, '__esModule', { value: true }));
	}

	new Promise(function (resolve, reject) { require(['./main'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject) }).then(result => console.log('importer', result));

});
