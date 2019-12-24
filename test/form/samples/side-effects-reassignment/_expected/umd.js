(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	var effect = function() {
		console.log('effect');
	};

	var alsoEffect = effect;
	alsoEffect();

})));
