(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('./lib/throttle.js')) :
	typeof define === 'function' && define.amd ? define(['./lib/throttle'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Lib.throttle));
})(this, (function (throttle) { 'use strict';

	throttle( () => {
		console.log( '.' );
	}, 500 );

	window.addEventListener( 'mousemove', throttle );

}));
