var bundle = (function (exports, external) {
	'use strict';

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	console.log('main');

	exports.value = external;

	return exports;

}({}, external));
