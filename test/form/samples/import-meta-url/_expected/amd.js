define(['module'], function (module) { 'use strict';

	document.body.innerText = new URL((typeof process !== 'undefined' && process.versions && process.versions.node ? 'file:' : '') + module.uri).href;

});
