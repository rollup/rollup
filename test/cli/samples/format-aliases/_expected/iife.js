var bundle = (function (exports, external) {
	'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var external__default = /*#__PURE__*/_interopDefaultLegacy(external);

	console.log('main');

	Object.defineProperty(exports, 'value', {
		enumerable: true,
		get: function () {
			return external__default['default'];
		}
	});

	return exports;

}({}, external));
