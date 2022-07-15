var bundle = (function (exports, external) {
	'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

	var external__default = /*#__PURE__*/_interopDefaultLegacy(external);

	console.log(external.value);

	Object.defineProperty(exports, 'reexported', {
		enumerable: true,
		get: function () { return external__default.default; }
	});

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, external);
