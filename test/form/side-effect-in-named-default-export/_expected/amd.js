define(['exports'], function (exports) { 'use strict';

	var foo;

	bar();

	function bar() {
		globalSideEffect = true;
	}

	exports.foo = foo;

	Object.defineProperty(exports, '__esModule', { value: true });

});
