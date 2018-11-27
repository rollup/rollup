define(['require'], function (require) { 'use strict';

	console.log('main1');
	new Promise(function (resolve, reject) { require(['./generated-chunk.js'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['./generated-chunk2.js'], resolve, reject) });

});
