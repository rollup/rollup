System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			Promise.resolve().then(function () { return depInlinedViaResolveId; }).then(console.log);
			Promise.resolve().then(function () { return depInlinedViaLoad; }).then(console.log);
			Promise.resolve().then(function () { return depInlinedViaTransform; }).then(console.log);
			module.import('./generated-dep-not-inlined.js').then(console.log);

			console.log('main');

			console.log('resolveId');
			const value = 'resolveId';

			var depInlinedViaResolveId = /*#__PURE__*/Object.freeze({
				__proto__: null,
				value: value
			});

			console.log('load');
			const value$1 = 'load';

			var depInlinedViaLoad = /*#__PURE__*/Object.freeze({
				__proto__: null,
				value: value$1
			});

			console.log('transform');
			const value$2 = 'transform';

			var depInlinedViaTransform = /*#__PURE__*/Object.freeze({
				__proto__: null,
				value: value$2
			});

		}
	};
});
