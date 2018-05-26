define(['require'], function (require) { 'use strict';

	console.log('main1');
	new Promise(function (resolve, reject) { require(["./main4.dynamic.js"], resolve, reject) });
	new Promise(function (resolve, reject) { require(["./main5.js"], resolve, reject) });

});
