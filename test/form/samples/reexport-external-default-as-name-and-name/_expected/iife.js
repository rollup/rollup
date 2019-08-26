var bundle = (function (exports, external) {
	'use strict';

	var external__default = 'default' in external ? external['default'] : external;

	console.log(external.value);

	exports.reexported = external__default;

	return exports;

}({}, external));
