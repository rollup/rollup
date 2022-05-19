define(['require', 'exports', './main'], (function (require, exports, main) { 'use strict';

	const sharedDynamic = true;

	new Promise(function (resolve, reject) { require(['./generated-dynamic2'], resolve, reject); });
	console.log(sharedDynamic);

	var dynamic1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		shared: main.shared
	});

	exports.dynamic1 = dynamic1;
	exports.sharedDynamic = sharedDynamic;

}));
