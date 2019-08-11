define(['https://external.com/external.js'], function (external) { 'use strict';

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	console.log(external);

});
