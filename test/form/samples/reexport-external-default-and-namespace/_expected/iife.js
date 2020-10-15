var bundle = (function (exports, external) {
	'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var external__default = /*#__PURE__*/_interopDefaultLegacy(external);



	Object.keys(external).forEach(function (k) {
		if (k !== 'default') Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () {
				return external[k];
			}
		});
	});
	Object.defineProperty(exports, 'default', {
		enumerable: true,
		get: function () {
			return external__default['default'];
		}
	});

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

}({}, external));
