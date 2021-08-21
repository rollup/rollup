'use strict';

function _interopNamespaceDefaultOnly (e) { return Object.freeze({ __proto__: null, 'default': e }); }

Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./main.js')); }).then(result => console.log('importer', result));
