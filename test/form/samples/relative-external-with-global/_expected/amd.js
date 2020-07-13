define(['./lib/throttle'], function (throttle) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var throttle__default = _interopDefault(throttle);

	const fn = throttle__default['default']( () => {
		console.log( '.' );
	}, 500 );

	window.addEventListener( 'mousemove', throttle__default['default'] );

});
