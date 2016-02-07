(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.computedProperties = global.computedProperties || {})));
}(this, function (exports) { 'use strict';

	var foo = 'foo';

	var x = {[foo]: 'bar'};

	exports.x = x;

}));
