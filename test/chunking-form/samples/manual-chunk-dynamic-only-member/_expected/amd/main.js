define(['require'], (function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-manual'], resolve, reject); }).then(n => console.log(n.a));

}));
