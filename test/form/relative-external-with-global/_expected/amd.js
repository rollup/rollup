define(['./lib/throttle.js'], function (throttle) { 'use strict';

	throttle = throttle && 'default' in throttle ? throttle['default'] : throttle;

	const fn = throttle( () => {
		console.log( '.' );
	}, 500 );

	window.addEventListener( 'mousemove', throttle );

});