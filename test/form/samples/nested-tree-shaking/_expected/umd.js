(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	function withEffects() {
		console.log('effect');
	}

	if (globalVar > 0) {
		console.log('effect');
		withEffects();
	}

}));
