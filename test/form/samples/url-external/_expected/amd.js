define(['https://external.com/external.js'], function (external) { 'use strict';

	external = external && Object.prototype.hasOwnProperty.call(external, 'default') ? external['default'] : external;

	console.log(external);

});
