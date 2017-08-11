(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var a = (1, 2, 3 );
	var b = (4, 5, 6 );
	foo( a, b );

	// verify works with no whitespace
	bar((1,2),(7,8));

})));
