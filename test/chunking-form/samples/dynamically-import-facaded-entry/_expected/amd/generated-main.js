define(['require', 'exports'], function (require, exports) { 'use strict';

	var value = 42;

	const promise = new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) }).then(result => console.log('main', result, value));

	exports.promise = promise;
	exports.value = value;

});
