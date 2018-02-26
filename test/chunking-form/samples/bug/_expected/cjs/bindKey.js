'use strict';

var ___baseRest_js = require('./_baseRest.js');
var ___createWrap_js = require('./_createWrap.js');
var ___getHolder_js = require('./_getHolder.js');
var ___replaceHolders_js = require('./_replaceHolders.js');

/** Used to compose bitmasks for function metadata. */
var WRAP_BIND_FLAG = 1,
    WRAP_BIND_KEY_FLAG = 2,
    WRAP_PARTIAL_FLAG = 32;

/**
 * Creates a function that invokes the method at `object[key]` with `partials`
 * prepended to the arguments it receives.
 *
 * This method differs from `_.bind` by allowing bound functions to reference
 * methods that may be redefined or don't yet exist. See
 * [Peter Michaux's article](http://peter.michaux.ca/articles/lazy-function-definition-pattern)
 * for more details.
 *
 * The `_.bindKey.placeholder` value, which defaults to `_` in monolithic
 * builds, may be used as a placeholder for partially applied arguments.
 *
 * @static
 * @memberOf _
 * @since 0.10.0
 * @category Function
 * @param {Object} object The object to invoke the method on.
 * @param {string} key The key of the method.
 * @param {...*} [partials] The arguments to be partially applied.
 * @returns {Function} Returns the new bound function.
 * @example
 *
 * var object = {
 *   'user': 'fred',
 *   'greet': function(greeting, punctuation) {
 *     return greeting + ' ' + this.user + punctuation;
 *   }
 * };
 *
 * var bound = _.bindKey(object, 'greet', 'hi');
 * bound('!');
 * // => 'hi fred!'
 *
 * object.greet = function(greeting, punctuation) {
 *   return greeting + 'ya ' + this.user + punctuation;
 * };
 *
 * bound('!');
 * // => 'hiya fred!'
 *
 * // Bound with placeholders.
 * var bound = _.bindKey(object, 'greet', _, '!');
 * bound('hi');
 * // => 'hiya fred!'
 */
var bindKey = ___baseRest_js.default(function(object, key, partials) {
  var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
  if (partials.length) {
    var holders = ___replaceHolders_js.default(partials, ___getHolder_js.default(bindKey));
    bitmask |= WRAP_PARTIAL_FLAG;
  }
  return ___createWrap_js.default(key, bitmask, object, partials, holders);
});

// Assign default placeholders.
bindKey.placeholder = {};

module.exports = bindKey;
