define(['require', './generated-dynamic.js'], function (require, dynamic) { 'use strict';

	Promise.all([new Promise(function (resolve, reject) { require(['./generated-dynamic.js'], resolve, reject) }), new Promise(function (resolve, reject) { require(['./generated-chunk.js'], resolve, reject) }), new Promise(function (resolve, reject) { require(['./generated-chunk2.js'], resolve, reject) })]).then(
		results => console.log(results, dynamic.DEP)
	);

});
