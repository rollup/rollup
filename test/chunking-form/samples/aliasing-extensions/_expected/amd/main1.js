define(['require'], function (require) { 'use strict';

	console.log('main1');
	new Promise(function (resolve, reject) { require(['./generated-chunk'], resolve, reject) });
	new Promise(function (resolve, reject) { require(['./generated-chunk2'], resolve, reject) });

});
