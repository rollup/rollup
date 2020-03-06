define(['./lib/throttle'], function (throttle) { 'use strict';

	throttle = throttle && Object.prototype.hasOwnProperty.call(throttle, 'default') ? throttle['default'] : throttle;

	const fn = throttle( () => {
		console.log( '.' );
	}, 500 );

	window.addEventListener( 'mousemove', throttle );

});
