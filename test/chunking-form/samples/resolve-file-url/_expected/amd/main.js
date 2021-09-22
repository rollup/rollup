define(['require'], (function (require) { 'use strict';

	const asset$1 = 'resolved';
	const chunk$1 = 'resolved';

	const asset = new URL(require.toUrl('./assets/asset-unresolved-8dcd7fca.txt'), document.baseURI).href;
	const chunk = new URL(require.toUrl('./nested/chunk.js'), document.baseURI).href;

	new Promise(function (resolve, reject) { require(['./nested/chunk2'], resolve, reject); }).then(result => console.log(result, chunk$1, chunk, asset$1, asset));

}));
