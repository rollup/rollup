define(['require'], (function (require) { 'use strict';

	console.log('main1');
	new Promise(function (resolve, reject) { require(['./generated-main4.dynamic'], resolve, reject); });
	new Promise(function (resolve, reject) { require(['./generated-main5'], resolve, reject); });

}));
