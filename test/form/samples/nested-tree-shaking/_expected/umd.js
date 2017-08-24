(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function withEffects() {
		console.log('effect');
	}

	if (globalVar > 0) {
		console.log('effect');
		withEffects();
	}

})));
