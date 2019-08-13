define(['./generated-dep', './generated-emitted'], function (dep, emitted) { 'use strict';

	console.log(emitted.id);

	console.log('main', dep.value);

});
