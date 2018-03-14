(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.foo = {})));
}(this, (function (exports) { 'use strict';

	var browserSpecificThing;

	if ('ActiveXObject' in window) {
		browserSpecificThing = "InternetExplorerThing";
	} else {
		browserSpecificThing = "DecentBrowserThing";
	}

	function foo() {}

	var browserStuff = /*#__PURE__*/(Object.freeze || Object)({
		browserSpecificThing: browserSpecificThing,
		foo: foo
	});

	console.log(browserSpecificThing);

	exports.B = browserStuff;

})));
