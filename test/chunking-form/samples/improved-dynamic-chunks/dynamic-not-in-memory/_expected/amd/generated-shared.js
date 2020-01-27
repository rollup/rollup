define(['require', './generated-dep'], function (require, dep) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) });
	console.log('shared', dep.value1);

});
