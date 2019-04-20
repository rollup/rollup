define(['module', 'require', './nested/chunk'], function (module, require, __chunk_1) { 'use strict';

	__chunk_1.log('main: ' + new URL(module.uri, document.baseURI).href);
	new Promise(function (resolve, reject) { require(['./nested/chunk2'], resolve, reject) });

});
