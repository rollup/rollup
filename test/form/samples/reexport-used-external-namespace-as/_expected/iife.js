var bundle = (function (exports, imported1, external2) {
	'use strict';

	console.log(imported1, external2.imported2);

	exports.external1 = imported1;
	exports.external2 = external2;

	return exports;

}({}, external1, external2));
