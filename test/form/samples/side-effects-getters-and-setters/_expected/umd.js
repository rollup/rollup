(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	const retained1a = {
		get effect () {
			console.log( 'effect' );
		},
		get noEffect () {
			
		}
	};

	const retained1b = retained1a.effect;

})));
