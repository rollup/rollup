define(['./_baseRest.js', './_createWrap.js', './_getHolder.js', './_replaceHolders.js'], function (___baseRest_js, ___createWrap_js, ___getHolder_js, ___replaceHolders_js) { 'use strict';

  /** Used to compose bitmasks for function metadata. */
  var WRAP_BIND_FLAG = 1,
      WRAP_PARTIAL_FLAG = 32;

  /**
   * Creates a function that invokes `func` with the `this` binding of `thisArg`
   * and `partials` prepended to the arguments it receives.
   *
   * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
   * may be used as a placeholder for partially applied arguments.
   *
   * **Note:** Unlike native `Function#bind`, this method doesn't set the "length"
   * property of bound functions.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to bind.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {...*} [partials] The arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * function greet(greeting, punctuation) {
   *   return greeting + ' ' + this.user + punctuation;
   * }
   *
   * var object = { 'user': 'fred' };
   *
   * var bound = _.bind(greet, object, 'hi');
   * bound('!');
   * // => 'hi fred!'
   *
   * // Bound with placeholders.
   * var bound = _.bind(greet, object, _, '!');
   * bound('hi');
   * // => 'hi fred!'
   */
  var bind = ___baseRest_js.default(function(func, thisArg, partials) {
    var bitmask = WRAP_BIND_FLAG;
    if (partials.length) {
      var holders = ___replaceHolders_js.default(partials, ___getHolder_js.default(bind));
      bitmask |= WRAP_PARTIAL_FLAG;
    }
    return ___createWrap_js.default(func, bitmask, thisArg, partials, holders);
  });

  // Assign default placeholders.
  bind.placeholder = {};

  return bind;

});
