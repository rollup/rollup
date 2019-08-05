define(['./dep1', './dep2'], function (dep1, dep2) { 'use strict';

	console.log(dep1.missing1, dep2.missing2, dep2.previousShimmedExport);

});
