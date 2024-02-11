define(['require'], (function (require) { 'use strict';

	const asset$1 = 'resolved';
	const chunk$1 = 'resolved';

	const asset = new URL(require.toUrl('./assets/asset-unresolved-B7Qh6_pN.txt'), document.baseURI).href;
	const chunk = new URL(require.toUrl('./nested/chunk2.js'), document.baseURI).href;

	new Promise(function (resolve, reject) { require(['./nested/chunk'], resolve, reject); }).then(result => console.log(result, chunk$1, chunk, asset$1, asset));

}));
