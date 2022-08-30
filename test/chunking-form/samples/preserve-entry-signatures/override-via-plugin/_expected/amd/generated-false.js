define(['require', 'exports'], (function (require, exports) { 'use strict';

	const shared = 'shared';

	console.log(shared);
	new Promise(function (resolve, reject) { require(['./generated-dynamic3'], resolve, reject); });

	exports.shared = shared;

}));
