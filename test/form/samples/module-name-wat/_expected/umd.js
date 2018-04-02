(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.foo = global.foo || {}, global.foo['@scoped/npm-package'] = global.foo['@scoped/npm-package'] || {}, global.foo['@scoped/npm-package'].bar = global.foo['@scoped/npm-package'].bar || {}, global.foo['@scoped/npm-package'].bar['why-would-you-do-this'] = {})));
}(this, (function (exports) { 'use strict';

	let foo = 'foo';

	exports.foo = foo;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
