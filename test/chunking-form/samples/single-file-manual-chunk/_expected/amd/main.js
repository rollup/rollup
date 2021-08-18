define(['require'], (function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-first'], resolve, reject); });
	new Promise(function (resolve, reject) { require(['./generated-second'], resolve, reject); }).then(function (n) { return n.b; });
	new Promise(function (resolve, reject) { require(['./generated-second'], resolve, reject); }).then(function (n) { return n.c; });

}));
