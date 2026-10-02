'use strict';

const DEP = 'DEP';

Promise.resolve().then(function () { return require('./generated-m.js'); }).then(m => console.log(m, DEP));

exports.DEP = DEP;
