define(['module'], function (module) { 'use strict';

	console.log(new URL((typeof process !== 'undefined' && process.versions && process.versions.node ? 'file:' : '') + module.uri).href);

});
