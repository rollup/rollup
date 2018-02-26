'use strict';

var ___getNative_js = require('./_getNative.js');

var defineProperty = (function() {
  try {
    var func = ___getNative_js.default(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;
