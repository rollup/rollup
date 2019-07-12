define(['require'], function (require) { 'use strict';

	const asset = 'resolved';
	const chunk = 'resolved';

	const asset$1 = new URL(require.toUrl('./assets/asset-unresolved-8dcd7fca.txt'), document.baseURI).href;
	const chunk$1 = new URL(require.toUrl('./nested/chunk.js'), document.baseURI).href;

	new Promise(function (resolve, reject) { require(['./nested/chunk2'], resolve, reject) }).then(result => console.log(result, chunk, chunk$1, asset, asset$1));

});
