define(['require', 'exports'], (function (require, exports) { 'use strict';

	const dep2 = 'dep2';

	console.log(dep2);
	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject); });

	exports.dep2 = dep2;

}));
