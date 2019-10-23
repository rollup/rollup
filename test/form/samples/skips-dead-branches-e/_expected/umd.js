(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	function bar () {
		console.log( 'this should be included' );
	}
	bar();

})));
