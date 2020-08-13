define(['external', './other'], function (external, other) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var external__default = /*#__PURE__*/_interopDefaultLegacy(external);

	const { value } = other.default;

	console.log(external__default['default'], value);

	var commonjs = 42;

	return commonjs;

});
