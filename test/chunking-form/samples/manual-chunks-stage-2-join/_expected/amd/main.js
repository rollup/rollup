define(['require', './generated-manual'], (function (require, manual) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-manual'], resolve, reject); }).then(function (n) { return n.x; }).then(n => console.log(n.x, manual.m));

}));
