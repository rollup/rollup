(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	function yar() {
		return {
			har() {
				console.log('har?');
			}
		};
	}

	yar.har();

}));
