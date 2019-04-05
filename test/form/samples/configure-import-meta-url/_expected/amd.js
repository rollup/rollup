define(['module'], function (module) { 'use strict';

	console.log('resolved');

	console.log(new URL(module.uri, document.baseURI).href);

	console.log('amd.js/configure-import-meta-url/main.js');

});
