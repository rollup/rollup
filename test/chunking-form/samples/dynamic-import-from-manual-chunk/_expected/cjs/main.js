'use strict';

require('./generated-manual.js');
require('./main.js');

const dep1 = 'dep1';

const dep2 = 'dep2';

console.log(dep1);

exports.dep1 = dep1;
exports.dep2 = dep2;
