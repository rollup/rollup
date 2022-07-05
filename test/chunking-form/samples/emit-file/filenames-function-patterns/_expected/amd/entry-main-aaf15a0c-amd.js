define(['require'], (function (require) { 'use strict';

	console.log('main');
	new Promise(function (resolve, reject) { require(['./chunk-deb-faae56f2-amd'], resolve, reject); }).then(console.log);

}));
