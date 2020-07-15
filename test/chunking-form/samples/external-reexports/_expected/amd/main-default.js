define(['exports', 'external-all', 'external-default', 'external-default-named', 'external-default-namespace'], function (exports, externalAll, externalDefault, externalDefaultNamed, externalDefaultNamespace) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var externalAll__default = /*#__PURE__*/_interopDefault(externalAll);
	var externalDefault__default = /*#__PURE__*/_interopDefault(externalDefault);
	var externalDefaultNamed__default = /*#__PURE__*/_interopDefault(externalDefaultNamed);
	var externalDefaultNamespace__default = /*#__PURE__*/_interopDefault(externalDefaultNamespace);



	Object.defineProperty(exports, 'foo', {
		enumerable: true,
		get: function () {
			return externalAll__default['default'];
		}
	});
	Object.defineProperty(exports, 'bar', {
		enumerable: true,
		get: function () {
			return externalDefault__default['default'];
		}
	});
	Object.defineProperty(exports, 'baz', {
		enumerable: true,
		get: function () {
			return externalDefaultNamed__default['default'];
		}
	});
	Object.defineProperty(exports, 'quux', {
		enumerable: true,
		get: function () {
			return externalDefaultNamespace__default['default'];
		}
	});

	Object.defineProperty(exports, '__esModule', { value: true });

});
