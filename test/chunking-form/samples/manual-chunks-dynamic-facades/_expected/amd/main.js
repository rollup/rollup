define(['require', './generated-dynamic'], function (require, dynamic) { 'use strict';

	Promise.all([new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) }), new Promise(function (resolve, reject) { require(['./generated-chunk'], resolve, reject) }), new Promise(function (resolve, reject) { require(['./generated-chunk2'], resolve, reject) })]).then(
		results => console.log(results, dynamic.DEP)
	);

});
