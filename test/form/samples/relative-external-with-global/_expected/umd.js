(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(require('../lib/throttle.js')) :
	typeof define === 'function' && define.amd ? define(['../lib/throttle.js'], factory) :
	(factory(global.Lib.throttle));
}(this, (function (throttle) { 'use strict';

	throttle = throttle && throttle.hasOwnProperty('default') ? throttle['default'] : throttle;

	const fn = throttle( () => {
		console.log( '.' );
	}, 500 );

	window.addEventListener( 'mousemove', throttle );

})));
