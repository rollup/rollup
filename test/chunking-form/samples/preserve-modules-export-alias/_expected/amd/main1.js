define(['exports', './dep.js'], function (exports, __dep_js) { 'use strict';



	exports.foo = __dep_js.foo;
	exports.bar = __dep_js.foo;

	Object.defineProperty(exports, '__esModule', { value: true });

});
