define(['require'], function (require) { 'use strict';

	var main = Promise.all([new Promise(function (resolve, reject) { require(['./entry'], function (m) { resolve({ 'default': m }); }, reject) }), new Promise(function (resolve, reject) { require(['./generated-other'], resolve, reject) })]);

	return main;

});
