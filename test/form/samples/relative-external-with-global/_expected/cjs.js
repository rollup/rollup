'use strict';

var throttle = require('./lib/throttle.js');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

throttle = _interopDefault(throttle);

const fn = throttle( () => {
	console.log( '.' );
}, 500 );

window.addEventListener( 'mousemove', throttle );
