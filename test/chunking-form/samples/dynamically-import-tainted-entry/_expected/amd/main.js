define(['require', 'exports'], function (require, exports) { 'use strict';

	var value = 42;

	const promise = new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) }).then(result => console.log('main', result, value));

	var main = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
		__proto__: null,
		promise: promise
	}, '__esModule', { value: true }));

	exports.main = main;
	exports.promise = promise;
	exports.value = value;

	Object.defineProperty(exports, '__esModule', { value: true });

});
