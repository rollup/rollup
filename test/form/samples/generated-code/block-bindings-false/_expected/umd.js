((global, factory) => {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('external')) :
	typeof define === 'function' && define.amd ? define(['external'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.foo));
})(this, (foo => { 'use strict';

	var _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { 'default': e };

	var foo__default = /*#__PURE__*/_interopDefaultLegacy(foo);

	console.log(foo__default["default"]);

}));
