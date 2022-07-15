(function (throttle) {
	'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

	var throttle__default = /*#__PURE__*/_interopDefaultLegacy(throttle);

	throttle__default.default( () => {
		console.log( '.' );
	}, 500 );

	window.addEventListener( 'mousemove', throttle__default.default );

})(Lib.throttle);
