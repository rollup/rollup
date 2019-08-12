define(['module', 'require', './nested/chunk'], function (module, require, log) { 'use strict';

	log.log('main: ' + new URL(module.uri, document.baseURI).href);
	new Promise(function (resolve, reject) { require(['./nested/chunk2'], resolve, reject) });

});
