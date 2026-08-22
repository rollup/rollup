'use strict';

const dep = 'dep';

console.log('lib', dep);

var lib = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({}, null));

exports.dep = dep;
exports.lib = lib;
