(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var V8Engine = (function () {
		function V8Engine () {}

		V8Engine.prototype.toString = function () { return 'V8'; };
		return V8Engine;
	}());

	var V6Engine = (function () {
		function V6Engine () {}

		V6Engine.prototype = V8Engine.prototype;
		V6Engine.prototype.toString = function () { return 'V6'; };
		return V6Engine;
	}());

	console.log( new V8Engine().toString() );

})));
