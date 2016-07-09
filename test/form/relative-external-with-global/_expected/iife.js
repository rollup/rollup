(function (throttle) {
	'use strict';

	throttle = 'default' in throttle ? throttle['default'] : throttle;

	const fn = throttle( () => {
		console.log( '.' );
	}, 500 );

	window.addEventListener( 'mousemove', throttle );

}(Lib.throttle));
