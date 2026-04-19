System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			Promise.resolve().then(function () { return dynamic2; }).then(console.log);
			console.log('dynamic1');
			const value1 = 'dynamic1';

			var dynamic1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
				value1: value1
			}, null));

			console.log('dynamic2');
			const value2 = 'dynamic2';

			var dynamic2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
				value2: value2
			}, null));

			Promise.resolve().then(function () { return dynamic1; }).then(console.log);
			console.log('main', value1, value2);

		})
	};
}));
