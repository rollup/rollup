define(['module'], function (module) { 'use strict';

	console.log(({ url: new URL(module.uri, document.baseURI).href }));

});
