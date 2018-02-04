System.register(['./_castFunction.js', './partial.js'], function (exports, module) {
  'use strict';
  var castFunction, partial;
  return {
    setters: [function (module) {
      castFunction = module.default;
    }, function (module) {
      partial = module.default;
    }],
    execute: function () {

      /**
       * Creates a function that provides `value` to `wrapper` as its first
       * argument. Any additional arguments provided to the function are appended
       * to those provided to the `wrapper`. The wrapper is invoked with the `this`
       * binding of the created function.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Function
       * @param {*} value The value to wrap.
       * @param {Function} [wrapper=identity] The wrapper function.
       * @returns {Function} Returns the new function.
       * @example
       *
       * var p = _.wrap(_.escape, function(func, text) {
       *   return '<p>' + func(text) + '</p>';
       * });
       *
       * p('fred, barney, & pebbles');
       * // => '<p>fred, barney, &amp; pebbles</p>'
       */
      function wrap(value, wrapper) {
        return partial(castFunction(wrapper), value);
      }
      exports('default', wrap);

    }
  };
});
