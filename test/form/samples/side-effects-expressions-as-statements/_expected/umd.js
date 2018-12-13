(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(typeof self !== 'undefined' ? self : this, function () { 'use strict';

	// Access getters with side-effects to e.g. force DOM repaints
	globalVar.getter;
	globalVar && globalVar.member && globalVar.member.getter;

	// Call pure constructors for side-effects for e.g. feature detection
	new Function('');

}));
