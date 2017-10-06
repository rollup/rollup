(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	// side-effect in condition
	var a = foo() ? 1 : 2;

	var unknownValue = bar();

	// unknown branch with side-effect
	var c = unknownValue ? foo() : 2;
	var d = unknownValue ? 1 : foo();
	var d1 = function () {};
	var d2 = function () {this.x = 1;};
	(unknownValue ? d1 : d2)();

	// known side-effect
	var h = foo();
	var h1 = (function () {this.x = 1;})();
	var i = foo();
	var i1 = (function () {this.x = 1;})();

})));
