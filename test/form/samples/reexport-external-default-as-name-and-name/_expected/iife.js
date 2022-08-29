var bundle = (function (exports, external) {
	'use strict';

	console.log(external.value);

	exports.reexported = external;

	return exports;

})({}, external);
