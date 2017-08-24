(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var effect = () => {};
	effect = function() {
		console.log('effect');
	};

	var alsoEffect = () => {};
	alsoEffect = effect;
	alsoEffect();

})));
