define(['module'], function (module) { 'use strict';

	var main = new URL((typeof process !== 'undefined' && process.versions && process.versions.node ? 'file:' : '') + module.uri + '/../assets/test-19916f7d.ext').href;

	return main;

});
