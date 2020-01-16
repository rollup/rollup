'use strict';

const shared = 'shared';

new Promise(function (resolve) { resolve(require('./generated-dynamic1.js')); });
console.log('main', shared);

exports.shared = shared;
