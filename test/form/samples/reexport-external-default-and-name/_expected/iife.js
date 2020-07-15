var bundle = (function (exports, external) {
	'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var external__default = /*#__PURE__*/_interopDefault(external);

	const value = 42;

	Object.defineProperty(exports, 'default', {
		enumerable: true,
		get: function () {
			return external__default['default'];
		}
	});
	exports.value = value;

	return exports;

}({}, external));
