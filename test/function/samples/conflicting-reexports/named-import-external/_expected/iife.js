var bundle = (function (exports, external) {
	'use strict';

	const renamedIndirectOverride = external.indirectOverride;

	Object.defineProperty(exports, 'noOverride', {
		enumerable: true,
		get: function () {
			return external.noOverride;
		}
	});
	Object.defineProperty(exports, 'renamedDirectOverride', {
		enumerable: true,
		get: function () {
			return external.directOverride;
		}
	});
	exports.renamedIndirectOverride = renamedIndirectOverride;
	Object.keys(external).forEach(function (k) {
		if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () {
				return external[k];
			}
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

}({}, external));
