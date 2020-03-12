define(function () { 'use strict';

	Promise.resolve().then(function () { return dynamic2; }).then(console.log);
	console.log('dynamic1');
	const value1 = 'dynamic1';

	var dynamic1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		value1: value1
	});

	console.log('dynamic2');
	const value2 = 'dynamic2';

	var dynamic2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		value2: value2
	});

	Promise.resolve().then(function () { return dynamic1; }).then(console.log);
	console.log('main', value1, value2);

});
