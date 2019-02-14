var myBundle = (function (exports) {
	'use strict';

	const localIsNan = isNan;

	const isNaN = localIsNan;

	exports.isNaN = isNaN;

	return exports;

}({}));
