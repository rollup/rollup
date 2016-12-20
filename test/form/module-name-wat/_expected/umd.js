(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.foo = global.foo || {}, global.foo['@scoped/npm-package'] = global.foo['@scoped/npm-package'] || {}, global.foo['@scoped/npm-package'].bar = global.foo['@scoped/npm-package'].bar || {}, global.foo['@scoped/npm-package'].bar['why-would-you-do-this'] = global.foo['@scoped/npm-package'].bar['why-would-you-do-this'] || {})));
}(this, (function (exports) { 'use strict';

	let foo = 'foo';

	exports.foo = foo;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
