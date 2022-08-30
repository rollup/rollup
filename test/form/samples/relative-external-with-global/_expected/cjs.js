'use strict';

var throttle = require('./lib/throttle.js');

throttle( () => {
	console.log( '.' );
}, 500 );

window.addEventListener( 'mousemove', throttle );
