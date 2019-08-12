define(['./generated-dep', './custom/build-start-chunk'], function (dep, buildStart) { 'use strict';

	console.log(buildStart.id);

	console.log('main', dep.value);

});
