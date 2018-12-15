(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	function yar() {
		console.log('yar?');
	}

	yar();

}));
