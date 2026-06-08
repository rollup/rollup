define(['require'], (function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-a'], resolve, reject); }).then(({a}) => console.log(a));
	new Promise(function (resolve, reject) { require(['./generated-b'], resolve, reject); }).then(({b}) => console.log(b));

}));
