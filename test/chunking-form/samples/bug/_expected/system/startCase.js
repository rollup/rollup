System.register(['./_createCompounder.js', './upperFirst.js'], function (exports, module) {
  'use strict';
  var createCompounder, upperFirst;
  return {
    setters: [function (module) {
      createCompounder = module.default;
    }, function (module) {
      upperFirst = module.default;
    }],
    execute: function () {

      /**
       * Converts `string` to
       * [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
       *
       * @static
       * @memberOf _
       * @since 3.1.0
       * @category String
       * @param {string} [string=''] The string to convert.
       * @returns {string} Returns the start cased string.
       * @example
       *
       * _.startCase('--foo-bar--');
       * // => 'Foo Bar'
       *
       * _.startCase('fooBar');
       * // => 'Foo Bar'
       *
       * _.startCase('__FOO_BAR__');
       * // => 'FOO BAR'
       */
      var startCase = createCompounder(function(result, word, index) {
        return result + (index ? ' ' : '') + upperFirst(word);
      });
      exports('default', startCase);

    }
  };
});
