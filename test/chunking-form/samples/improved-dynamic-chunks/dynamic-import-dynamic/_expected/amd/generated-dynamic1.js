define(['require', 'exports'], function (require, exports) { 'use strict';

	const value = 'shared';

	console.log('dynamic1', value);
	new Promise(function (resolve, reject) { require(['./generated-dynamic2'], resolve, reject) });

	exports.value = value;

});
