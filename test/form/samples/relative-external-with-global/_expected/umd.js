(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('./lib/throttle.js')) :
	typeof define === 'function' && define.amd ? define(['./lib/throttle.js'], factory) :
	factory(global.Lib.throttle);
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (throttle) { 'use strict';

	throttle = throttle && Object.prototype.hasOwnProperty.call(throttle, 'default') ? throttle['default'] : throttle;

	const fn = throttle( () => {
		console.log( '.' );
	}, 500 );

	window.addEventListener( 'mousemove', throttle );

})));
