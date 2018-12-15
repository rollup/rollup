(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	function baz() {
		console.log("baz");
	}
	baz();

}));
