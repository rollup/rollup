define(['exports', './main1', './generated-dep2'], function (exports, main1, dep2) { 'use strict';

	console.log('dynamic1', main1.value1);

	exports.value1 = main1.value1;

});
