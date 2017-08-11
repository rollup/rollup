import throttle from './lib/throttle.js';

const fn = throttle( () => {
	console.log( '.' );
}, 500 );

window.addEventListener( 'mousemove', throttle );