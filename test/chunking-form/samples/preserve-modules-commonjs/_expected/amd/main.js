define(['external', './commonjs'], function (external, commonjs) { 'use strict';

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	console.log(commonjs.default, external);

});
