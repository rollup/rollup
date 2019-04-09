define(['require'], function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./dynamic-included.js'], resolve, reject) }).then(result => console.log(result));

});
