System.register(['./isObject.js'], function (exports, module) {
  'use strict';
  var isObject;
  return {
    setters: [function (module) {
      isObject = module.default;
    }],
    execute: function () {

      /** Built-in value references. */
      var objectCreate = Object.create;

      /**
       * The base implementation of `_.create` without support for assigning
       * properties to the created object.
       *
       * @private
       * @param {Object} proto The object to inherit from.
       * @returns {Object} Returns the new object.
       */
      var baseCreate = (function() {
        function object() {}
        return function(proto) {
          if (!isObject(proto)) {
            return {};
          }
          if (objectCreate) {
            return objectCreate(proto);
          }
          object.prototype = proto;
          var result = new object;
          object.prototype = undefined;
          return result;
        };
      }());
      exports('default', baseCreate);

    }
  };
});
