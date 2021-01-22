import throttle from './lib/throttle.js';

throttle( () => {
	console.log( '.' );
}, 500 );

window.addEventListener( 'mousemove', throttle );
