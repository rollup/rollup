define(['module', './generated-chunk.js'], function (module, __chunk_1) { 'use strict';

	console.log('virtual', __chunk_1.value);
	new Worker(new URL(module.uri + '/../load.js', document.baseURI).href);

	console.log('main', __chunk_1.value);

});
