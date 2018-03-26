(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function getStringA() {
		return 'A';
	}

	console.log(getStringA());

	console.log(false);

	console.log(true);

	function getStringD() {
		return 'D';
	}

	console.log(getStringD());

})));
