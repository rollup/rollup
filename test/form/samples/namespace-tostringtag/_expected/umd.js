(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory(global.iife = {});
}(typeof self !== 'undefined' ? self : this, function (exports) { 'use strict';

	var self = {
		get p () { return p$$1; }
	};
	if (typeof Symbol !== 'undefined' && Symbol.toStringTag)
		Object.defineProperty(self, Symbol.toStringTag, { value: 'Module' });
	else
		Object.defineProperty(self, 'toString', { value: function () { return '[object Module]' } });
	/*#__PURE__*/Object.freeze(self);

	console.log(Object.keys(self));

	var p$$1 = 5;

	exports.p = p$$1;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
