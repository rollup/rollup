'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var throttle = _interopDefault(require('./lib/throttle.js'));

const fn = throttle( () => {
	console.log( '.' );
}, 500 );

window.addEventListener( 'mousemove', throttle );
