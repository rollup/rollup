define(['require'], (function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./lib'], resolve, reject); }).then(function (n) { return n.lib; }).then(console.log);

}));
