define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-chunk.js'], resolve, reject) });
	console.log('main');

});
