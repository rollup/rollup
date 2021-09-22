define(['require', 'exports'], (function (require, exports) { 'use strict';

	const value1 = 'dep';

	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject); });
	console.log('shared', value1);

	exports.value1 = value1;

}));
