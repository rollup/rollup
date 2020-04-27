define(['external', './proxy'], function (path, proxy) { 'use strict';

	path = path && Object.prototype.hasOwnProperty.call(path, 'default') ? path['default'] : path;

	console.log(path.normalize('foo\\bar'));
	console.log(path.normalize('foo\\bar'));

});
