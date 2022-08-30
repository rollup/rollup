var bundle = (function (exports, external1, external2) {
	'use strict';

	const dynamic = import('external3');

	exports.external1 = external1.external1;
	exports.dynamic = dynamic;
	for (var k in external2) {
		if (k !== 'default' && !exports.hasOwnProperty(k)) exports[k] = external2[k];
	}

	return exports;

})({}, external1, external2);
