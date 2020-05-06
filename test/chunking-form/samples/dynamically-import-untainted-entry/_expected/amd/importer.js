define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./main'], function (m) { resolve({ 'default': m }); }, reject) }).then(result => console.log('importer', result));

});
