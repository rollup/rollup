var bundle = (function (exports, external) {
	'use strict';

	external = external && Object.prototype.hasOwnProperty.call(external, 'default') ? external['default'] : external;

	console.log('main');

	exports.value = external;

	return exports;

}({}, external));
