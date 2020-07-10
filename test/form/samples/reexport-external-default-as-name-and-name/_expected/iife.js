var bundle = (function (exports, external) {
	'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

	var external__default = _interopDefault(external);

	console.log(external.value);

	exports.reexported = external__default;

	return exports;

}({}, external));
