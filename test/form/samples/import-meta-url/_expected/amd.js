define(['module'], function (module) { 'use strict';

	console.log(new URL(module.uri.startsWith('file:') ? module.uri : 'file:' + module.uri).href);

});
