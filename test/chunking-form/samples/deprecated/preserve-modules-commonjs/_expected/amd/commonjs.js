define(['external', './other'], function (external, other) { 'use strict';

	external = external && Object.prototype.hasOwnProperty.call(external, 'default') ? external['default'] : external;

	const { value } = other.default;

	console.log(external, value);

	var commonjs = 42;

	return commonjs;

});
