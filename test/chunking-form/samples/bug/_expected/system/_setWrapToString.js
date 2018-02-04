System.register(['./_getWrapDetails.js', './_insertWrapDetails.js', './_setToString.js', './_updateWrapDetails.js'], function (exports, module) {
  'use strict';
  var getWrapDetails, insertWrapDetails, setToString, updateWrapDetails;
  return {
    setters: [function (module) {
      getWrapDetails = module.default;
    }, function (module) {
      insertWrapDetails = module.default;
    }, function (module) {
      setToString = module.default;
    }, function (module) {
      updateWrapDetails = module.default;
    }],
    execute: function () {

      /**
       * Sets the `toString` method of `wrapper` to mimic the source of `reference`
       * with wrapper details in a comment at the top of the source body.
       *
       * @private
       * @param {Function} wrapper The function to modify.
       * @param {Function} reference The reference function.
       * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
       * @returns {Function} Returns `wrapper`.
       */
      function setWrapToString(wrapper, reference, bitmask) {
        var source = (reference + '');
        return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
      }
      exports('default', setWrapToString);

    }
  };
});
