System.register([], function () {
	'use strict';
	return {
		execute: function () {

			Promise.resolve().then(function () { return dynamic2; });
			console.log('dynamic1');

			Promise.resolve().then(function () { return dynamic3; });
			console.log('dynamic2');

			var dynamic2 = /*#__PURE__*/Object.freeze({
				__proto__: null
			});

			Promise.resolve().then(function () { return dynamic4; });
			console.log('dynamic3');

			var dynamic3 = /*#__PURE__*/Object.freeze({
				__proto__: null
			});

			Promise.resolve().then(function () { return dynamic5; });
			console.log('dynamic4');

			var dynamic4 = /*#__PURE__*/Object.freeze({
				__proto__: null
			});

			console.log('dynamic5');

			var dynamic5 = /*#__PURE__*/Object.freeze({
				__proto__: null
			});

		}
	};
});
