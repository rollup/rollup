'use strict';

console.log('dep');

const dep = 'dep';

console.log('dynamic', dep);
const dynamic = 'dynamic';

exports.dep = dep;
exports.dynamic = dynamic;
