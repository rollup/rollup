'use strict';

const shared = 'shared';

Promise.resolve().then(function () { return require('./generated-dynamic1.js'); });

exports.shared = shared;
