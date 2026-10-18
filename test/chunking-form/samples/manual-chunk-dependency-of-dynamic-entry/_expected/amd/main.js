define(['require'], (function (require) { 'use strict';

	console.log(new Promise(function (resolve, reject) { require(['./generated-dynamic'], resolve, reject); }));

}));
