(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	const mutateThis = () => {
		undefined.x = 1;
	};

	function Test () {
		mutateThis();
	}

	const test = new Test();

})));
