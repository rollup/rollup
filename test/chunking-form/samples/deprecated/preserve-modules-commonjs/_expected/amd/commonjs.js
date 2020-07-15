define(['external', './other'], function (external, other) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var external__default = /*#__PURE__*/_interopDefault(external);

	const { value } = other.default;

	console.log(external__default['default'], value);

	var commonjs = 42;

	return commonjs;

});
