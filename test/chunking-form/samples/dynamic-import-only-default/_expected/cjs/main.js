'use strict';

var main = Promise.all([Promise.resolve({ 'default': require('./entry.js') }), Promise.resolve(require('./generated-other.js'))]);

module.exports = main;
