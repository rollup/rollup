define(['require'], (function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./main'], resolve, reject); }).then(result => console.log('importer', result));

}));
