define(['./lib/throttle.js'], function (throttle) { 'use strict';

	throttle = throttle && throttle.hasOwnProperty('default') ? throttle['default'] : throttle;

	const fn = throttle( () => {
		console.log( '.' );
	}, 500 );

	window.addEventListener( 'mousemove', throttle );

});