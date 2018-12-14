(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	function a () {
		console.log('effect');
	}

	a();

}));
