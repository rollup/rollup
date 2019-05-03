define(['module', 'require'], function (module, require) { 'use strict';

	const asset = 'resolved';
	const chunk = 'resolved';

	const asset$1 = new URL(module.uri + '/../assets/asset-unresolved-9548436d.txt', document.baseURI).href;
	const chunk$1 = new URL(module.uri + '/../nested/chunk.js', document.baseURI).href;

	new Promise(function (resolve, reject) { require(['./nested/chunk2'], resolve, reject) }).then(result => console.log(result, chunk, chunk$1, asset, asset$1));

});
