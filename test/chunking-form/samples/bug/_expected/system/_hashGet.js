System.register(['./_nativeCreate.js'], function (exports, module) {
  'use strict';
  var nativeCreate;
  return {
    setters: [function (module) {
      nativeCreate = module.default;
    }],
    execute: function () {

      /** Used to stand-in for `undefined` hash values. */
      var HASH_UNDEFINED = '__lodash_hash_undefined__';

      /** Used for built-in method references. */
      var objectProto = Object.prototype;

      /** Used to check objects for own properties. */
      var hasOwnProperty = objectProto.hasOwnProperty;

      /**
       * Gets the hash value for `key`.
       *
       * @private
       * @name get
       * @memberOf Hash
       * @param {string} key The key of the value to get.
       * @returns {*} Returns the entry value.
       */
      function hashGet(key) {
        var data = this.__data__;
        if (nativeCreate) {
          var result = data[key];
          return result === HASH_UNDEFINED ? undefined : result;
        }
        return hasOwnProperty.call(data, key) ? data[key] : undefined;
      }
      exports('default', hashGet);

    }
  };
});
