define(['require', './generated-manual', './generated-x'], (function (require, manual, x) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-x'], resolve, reject); }).then(n => console.log(n.x, manual.m));

}));
