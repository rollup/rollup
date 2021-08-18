define(['require'], (function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-dynamic1'], resolve, reject); });
	console.log('main');

}));
