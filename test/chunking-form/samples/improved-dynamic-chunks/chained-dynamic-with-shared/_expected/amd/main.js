define(['require', 'exports'], (function (require, exports) { 'use strict';

	const shared = 'shared';

	new Promise(function (resolve, reject) { require(['./generated-dynamic1'], resolve, reject); });

	exports.shared = shared;

}));
