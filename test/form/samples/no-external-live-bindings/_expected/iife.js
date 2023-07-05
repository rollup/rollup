var bundle = (function (exports, external1, external2) {
	'use strict';

	const dynamic = import('external3');

	exports.external1 = external1.external1;
	exports.dynamic = dynamic;
	Object.keys(external2).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = external2[k];
	});

	return exports;

})({}, external1, external2);
