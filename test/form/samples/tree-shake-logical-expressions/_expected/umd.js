(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

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

}));
