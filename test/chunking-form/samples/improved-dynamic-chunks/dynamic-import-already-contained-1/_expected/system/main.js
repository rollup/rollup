System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			Promise.resolve().then(function () { return main; }).then(console.log);
			console.log('dep1');
			const value1 = 'dep1';

			var dep1 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				value1: value1
			});

			Promise.resolve().then(function () { return dep1; }).then(console.log);
			console.log('dep2');
			const value2 = 'dep2';

			Promise.resolve().then(function () { return main; }).then(console.log);
			console.log('main', value1, value2);
			const value = exports("value", 'main');

			var main = /*#__PURE__*/Object.freeze({
				__proto__: null,
				value: value
			});

		})
	};
}));
