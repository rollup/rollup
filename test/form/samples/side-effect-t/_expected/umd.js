(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	function foo () {
		throw new Error( 'throw side effect' );
	}

	foo();

}));
