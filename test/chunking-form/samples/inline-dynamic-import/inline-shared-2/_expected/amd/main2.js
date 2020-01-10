define(['require', './generated-inlined'], function (require, inlined) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-inlined'], resolve, reject) }).then(console.log);

	console.log('main2');

});
