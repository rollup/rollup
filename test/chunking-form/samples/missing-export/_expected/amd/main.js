define(['./dep.js'], function (dep) { 'use strict';

	dep.missingFn();
	dep.x(dep.missingFn, dep.missingFn);

});
