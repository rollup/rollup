define(['external', './other'], function (external, other) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

	external = _interopDefault(external);

	const { value } = other.default;

	console.log(external, value);

	var commonjs = 42;

	return commonjs;

});
