(function (factory) {
	typeof define === 'function' && define.amd ? define(['https://external.com/external.js'], factory) :
	factory(global.external);
}(function (external) { 'use strict';

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	console.log(external);

}));
