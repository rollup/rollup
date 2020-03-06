define(['external', './commonjs'], function (external, commonjs) { 'use strict';

	external = external && Object.prototype.hasOwnProperty.call(external, 'default') ? external['default'] : external;

	console.log(commonjs.default, external);

});
