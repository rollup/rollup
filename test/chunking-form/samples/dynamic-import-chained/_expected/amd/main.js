define(['require'], function (require) { 'use strict';

	console.log('main');
	new Promise(function (resolve, reject) { require(['./generated-chunk2'], resolve, reject) });

});
