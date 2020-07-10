var bundle = (function (exports, external) {
	'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

	var external__default = _interopDefault(external);



	Object.keys(external).forEach(function (k) {
		if (k !== 'default') Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () {
				return external[k];
			}
		});
	});
	exports.default = external__default;

	return exports;

}({}, external));
