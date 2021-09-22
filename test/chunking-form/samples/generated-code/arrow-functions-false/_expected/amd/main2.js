define(['require'], (function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-dep1'], resolve, reject); }).then(function (n) { return n.dep1; }).then(console.log);

}));
