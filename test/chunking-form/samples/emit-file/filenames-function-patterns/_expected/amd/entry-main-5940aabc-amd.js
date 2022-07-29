define(['require'], (function (require) { 'use strict';

	console.log('main');
	new Promise(function (resolve, reject) { require(['./chunk-deb-87ce45a9-amd'], resolve, reject); }).then(console.log);

}));
