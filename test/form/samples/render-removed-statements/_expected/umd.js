(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	if (globalVar) {
		// lead retained
		console.log(1); // trail retained
	}

	if (globalVar) {
		// lead retained
		console.log(1); // trail retained
	}

	if (globalVar) {
		// lead retained
		console.log(1); // trail retained
	}

	if (globalVar) { /* retained */ console.log(1);}

	if (globalVar) { /* retained */ console.log(1);}

	if (globalVar) { /* retained */ console.log(1);}

})));
