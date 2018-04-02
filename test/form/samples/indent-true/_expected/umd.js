(function (global, factory) {
	typeof module === 'object' && module.exports ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.foo = factory());
}(this, (function () { 'use strict';

	function foo () {
		console.log( 'indented with tabs' );
	}

	return foo;

})));
