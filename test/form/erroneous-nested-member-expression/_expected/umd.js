(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function yar() {
		return {
			har() {
				console.log('har?');
			}
		};
	}

	yar.har();

})));
