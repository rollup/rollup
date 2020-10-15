define(['require'], function (require) { 'use strict';

	function _interopNamespaceDefaultOnly(e) {
		return Object.freeze({__proto__: null, [Symbol.toStringTag]: 'Module', 'default': e});
	}

	new Promise(function (resolve, reject) { require(['./foo'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject) }).then(console.log);

});
