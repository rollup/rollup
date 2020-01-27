define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./main'], resolve, reject) });
	console.log('dynamic2');

});
