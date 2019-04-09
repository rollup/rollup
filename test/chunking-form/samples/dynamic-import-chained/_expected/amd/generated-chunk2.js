define(['require'], function (require) { 'use strict';

	console.log('dep1');
	new Promise(function (resolve, reject) { require(['./generated-chunk.js'], resolve, reject) });

});
