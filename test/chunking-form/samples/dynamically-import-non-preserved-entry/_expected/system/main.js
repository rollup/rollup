System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var value = exports('v', 42);

			const promise = module.import('./generated-dynamic.js').then(result => console.log('main', result, value));

			var main = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
				__proto__: null,
				promise: promise
			}, '__esModule', { value: true }));
			exports('m', main);

		}
	};
});
