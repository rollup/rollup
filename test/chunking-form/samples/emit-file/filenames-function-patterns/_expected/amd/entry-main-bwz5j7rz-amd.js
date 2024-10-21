define(['require'], (function (require) { 'use strict';

	console.log('main');
	new Promise(function (resolve, reject) { require(['./chunk-deb-hzzglgfk-amd'], resolve, reject); }).then(console.log);

}));
