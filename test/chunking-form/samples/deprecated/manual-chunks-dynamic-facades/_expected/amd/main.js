define(['require', './generated-dynamic'], function (require, dynamic) { 'use strict';

	Promise.all([new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) }).then(function (n) { return n.dynamic1; }), new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) }).then(function (n) { return n.dynamic2; }), new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) }).then(function (n) { return n.dynamic3; })]).then(
		results => console.log(results, dynamic.DEP)
	);

});
