define(['./dep'], function (dep) { 'use strict';

	dep.missingFn();
	dep.x(dep.missingFn, dep.missingFn);

});
