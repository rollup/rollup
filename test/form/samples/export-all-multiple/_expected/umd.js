(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(exports, require('foo'), require('bar'), require('baz')) :
	typeof define === 'function' && define.amd ? define(['exports', 'foo', 'bar', 'baz'], factory) :
	(factory((global.myBundle = {}),global.foo,global.bar,global.baz));
}(this, (function (exports,foo,bar,baz) { 'use strict';

	Object.keys(foo).forEach(function (key) { exports[key] = foo[key]; });
	Object.keys(bar).forEach(function (key) { exports[key] = bar[key]; });
	Object.keys(baz).forEach(function (key) { exports[key] = baz[key]; });

	Object.defineProperty(exports, '__esModule', { value: true });

})));
