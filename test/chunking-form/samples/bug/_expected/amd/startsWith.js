define(['./_baseClamp.js', './_baseToString.js', './toInteger.js', './toString.js'], function (___baseClamp_js, ___baseToString_js, __toInteger_js, __toString_js) { 'use strict';

  /**
   * Checks if `string` starts with the given target string.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category String
   * @param {string} [string=''] The string to inspect.
   * @param {string} [target] The string to search for.
   * @param {number} [position=0] The position to search from.
   * @returns {boolean} Returns `true` if `string` starts with `target`,
   *  else `false`.
   * @example
   *
   * _.startsWith('abc', 'a');
   * // => true
   *
   * _.startsWith('abc', 'b');
   * // => false
   *
   * _.startsWith('abc', 'b', 1);
   * // => true
   */
  function startsWith(string, target, position) {
    string = __toString_js.default(string);
    position = position == null
      ? 0
      : ___baseClamp_js.default(__toInteger_js.default(position), 0, string.length);

    target = ___baseToString_js.default(target);
    return string.slice(position, position + target.length) == target;
  }

  return startsWith;

});
