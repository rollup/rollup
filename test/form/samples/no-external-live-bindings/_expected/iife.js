var bundle = (function (exports, external1, external2) {
	'use strict';

	const dynamic = import('external3');

	Object.keys(external2).forEach(function (k) {
		if (k !== 'default') exports[k] = external2[k];
	});
	exports.external1 = external1.external1;
	exports.dynamic = dynamic;

	return exports;

}({}, external1, external2));
