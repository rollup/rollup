System.register(['./_baseCreate.js', './_getPrototype.js', './_isPrototype.js'], function (exports, module) {
  'use strict';
  var baseCreate, getPrototype, isPrototype;
  return {
    setters: [function (module) {
      baseCreate = module.default;
    }, function (module) {
      getPrototype = module.default;
    }, function (module) {
      isPrototype = module.default;
    }],
    execute: function () {

      /**
       * Initializes an object clone.
       *
       * @private
       * @param {Object} object The object to clone.
       * @returns {Object} Returns the initialized clone.
       */
      function initCloneObject(object) {
        return (typeof object.constructor == 'function' && !isPrototype(object))
          ? baseCreate(getPrototype(object))
          : {};
      }
      exports('default', initCloneObject);

    }
  };
});
