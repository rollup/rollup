(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var bool = true;

	const hs = document.documentElement.style;

	if ( bool ) {
		hs.color = "#222";
	}

})));
