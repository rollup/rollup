define(['require'], function (require) { 'use strict';

	console.log('no importer', new URL(require.toUrl('./generated-lib.js'), document.baseURI).href);
	console.log('from maim', new URL(require.toUrl('./generated-lib.js'), document.baseURI).href);
	console.log('from nested', new URL(require.toUrl('./generated-lib2.js'), document.baseURI).href);

});
