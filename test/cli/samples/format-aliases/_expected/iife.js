var bundle = (function (exports, external) {
	'use strict';

	console.log('main');

	exports.value = external;

	return exports;

})({}, external);
