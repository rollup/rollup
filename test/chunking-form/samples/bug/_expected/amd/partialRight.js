define(['./_baseRest.js', './_createWrap.js', './_getHolder.js', './_replaceHolders.js'], function (___baseRest_js, ___createWrap_js, ___getHolder_js, ___replaceHolders_js) { 'use strict';

  /** Used to compose bitmasks for function metadata. */
  var WRAP_PARTIAL_RIGHT_FLAG = 64;

  /**
   * This method is like `_.partial` except that partially applied arguments
   * are appended to the arguments it receives.
   *
   * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic
   * builds, may be used as a placeholder for partially applied arguments.
   *
   * **Note:** This method doesn't set the "length" property of partially
   * applied functions.
   *
   * @static
   * @memberOf _
   * @since 1.0.0
   * @category Function
   * @param {Function} func The function to partially apply arguments to.
   * @param {...*} [partials] The arguments to be partially applied.
   * @returns {Function} Returns the new partially applied function.
   * @example
   *
   * function greet(greeting, name) {
   *   return greeting + ' ' + name;
   * }
   *
   * var greetFred = _.partialRight(greet, 'fred');
   * greetFred('hi');
   * // => 'hi fred'
   *
   * // Partially applied with placeholders.
   * var sayHelloTo = _.partialRight(greet, 'hello', _);
   * sayHelloTo('fred');
   * // => 'hello fred'
   */
  var partialRight = ___baseRest_js.default(function(func, partials) {
    var holders = ___replaceHolders_js.default(partials, ___getHolder_js.default(partialRight));
    return ___createWrap_js.default(func, WRAP_PARTIAL_RIGHT_FLAG, undefined, partials, holders);
  });

  // Assign default placeholders.
  partialRight.placeholder = {};

  return partialRight;

});
