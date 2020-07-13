(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('./lib/throttle.js')) :
	typeof define === 'function' && define.amd ? define(['./lib/throttle.js'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Lib.throttle));
}(this, (function (throttle) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var throttle__default = _interopDefault(throttle);

	const fn = throttle__default['default']( () => {
		console.log( '.' );
	}, 500 );

	window.addEventListener( 'mousemove', throttle__default['default'] );

})));
