define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-dynamic2'], resolve, reject) });
	console.log('dynamic1');

});
