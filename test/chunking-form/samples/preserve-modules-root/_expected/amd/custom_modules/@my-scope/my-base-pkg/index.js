define(['exports'], function (exports) { 'use strict';

	var hello = 'world';

	var hello_1 = hello;

	var myBasePkg = /*#__PURE__*/Object.defineProperty({
		hello: hello_1
	}, '__esModule', {value: true});

	exports.default = myBasePkg;
	exports.hello = hello_1;

	Object.defineProperty(exports, '__esModule', { value: true });

});
