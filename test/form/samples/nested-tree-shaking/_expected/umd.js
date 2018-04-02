(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' && !module.nodeType ? factory() :
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
