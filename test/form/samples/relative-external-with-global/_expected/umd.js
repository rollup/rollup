(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('./lib/throttle.js')) :
	typeof define === 'function' && define.amd ? define(['./lib/throttle.js'], factory) :
	(global = global || self, factory(global.Lib.throttle));
}(this, (function (throttle) { 'use strict';

	throttle = throttle && throttle.hasOwnProperty('default') ? throttle['default'] : throttle;

	const fn = throttle( () => {
		console.log( '.' );
	}, 500 );

	window.addEventListener( 'mousemove', throttle );

})));
