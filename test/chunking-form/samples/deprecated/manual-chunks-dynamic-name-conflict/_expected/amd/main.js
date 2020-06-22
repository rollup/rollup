define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) }).then(function (n) { return n.dynamic1; }).then(result => console.log(result));
	new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject) }).then(function (n) { return n.dynamic2; }).then(result => console.log(result));

});
