var bundle = (function (exports, json) {
	'use strict';

	console.log(json);

	import('./foo.json').then(console.log);

	exports.json = json;

	return exports;

})({}, json);
