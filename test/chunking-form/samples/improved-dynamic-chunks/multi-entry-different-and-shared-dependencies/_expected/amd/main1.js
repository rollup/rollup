define(['require', 'exports', './generated-from-main-1-and-dynamic', './generated-from-main-1-and-2'], (function (require, exports, fromMain1AndDynamic, fromMain1And2) { 'use strict';

	console.log('main1', fromMain1AndDynamic.value1, fromMain1And2.value2, fromMain1And2.value3);
	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject); });

	exports.value1 = fromMain1AndDynamic.value1;
	exports.value2 = fromMain1And2.value2;
	exports.value3 = fromMain1And2.value3;

}));
