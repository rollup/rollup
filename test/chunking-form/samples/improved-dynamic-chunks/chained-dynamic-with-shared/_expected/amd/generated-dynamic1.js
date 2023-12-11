define(['./main'], (function (main) { 'use strict';

	Promise.resolve().then(function () { return dynamic2; });
	console.log('dynamic1');

	var dynamic2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		shared: main.shared
	});

}));
