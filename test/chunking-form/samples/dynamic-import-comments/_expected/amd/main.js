define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require([
	/* webpackChunkName: "chunk-name" */
	'./foo.js'/*suffix*/], resolve, reject) });

});
