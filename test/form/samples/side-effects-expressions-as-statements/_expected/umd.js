(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	// Use strict has an effect
	'use strict';

	// Access getters with side-effects to e.g. force DOM repaints
	globalVar.getter;
	globalVar && globalVar.member && globalVar.member.getter;

	// Call pure constructors for side-effects for e.g. feature detection
	new Function('');

})));
