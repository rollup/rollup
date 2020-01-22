define(['exports', './generated-from-main-1-and-dynamic', './generated-from-main-1-and-2'], function (exports, fromMain1AndDynamic, fromMain1And2) { 'use strict';

	console.log('dynamic1', fromMain1AndDynamic.value1, fromMain1And2.value2);

	exports.value1 = fromMain1AndDynamic.value1;
	exports.value2 = fromMain1And2.value2;

});
