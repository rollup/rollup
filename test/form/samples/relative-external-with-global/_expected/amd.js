define(['./lib/throttle'], (function (throttle) { 'use strict';

	throttle( () => {
		console.log( '.' );
	}, 500 );

	window.addEventListener( 'mousemove', throttle );

}));
