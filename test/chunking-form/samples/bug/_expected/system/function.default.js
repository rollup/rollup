System.register(['./after.js', './ary.js', './before.js', './bind.js', './bindKey.js', './curry.js', './curryRight.js', './debounce.js', './defer.js', './delay.js', './flip.js', './memoize.js', './negate.js', './once.js', './overArgs.js', './partial.js', './partialRight.js', './rearg.js', './rest.js', './spread.js', './throttle.js', './unary.js', './wrap.js'], function (exports, module) {
  'use strict';
  var after, ary, before, bind, bindKey, curry, curryRight, debounce, defer, delay, flip, memoize, negate, once, overArgs, partial, partialRight, rearg, rest, spread, throttle, unary, wrap;
  return {
    setters: [function (module) {
      after = module.default;
    }, function (module) {
      ary = module.default;
    }, function (module) {
      before = module.default;
    }, function (module) {
      bind = module.default;
    }, function (module) {
      bindKey = module.default;
    }, function (module) {
      curry = module.default;
    }, function (module) {
      curryRight = module.default;
    }, function (module) {
      debounce = module.default;
    }, function (module) {
      defer = module.default;
    }, function (module) {
      delay = module.default;
    }, function (module) {
      flip = module.default;
    }, function (module) {
      memoize = module.default;
    }, function (module) {
      negate = module.default;
    }, function (module) {
      once = module.default;
    }, function (module) {
      overArgs = module.default;
    }, function (module) {
      partial = module.default;
    }, function (module) {
      partialRight = module.default;
    }, function (module) {
      rearg = module.default;
    }, function (module) {
      rest = module.default;
    }, function (module) {
      spread = module.default;
    }, function (module) {
      throttle = module.default;
    }, function (module) {
      unary = module.default;
    }, function (module) {
      wrap = module.default;
    }],
    execute: function () {

      var func = exports('default', {
        after, ary, before, bind, bindKey,
        curry, curryRight, debounce, defer, delay,
        flip, memoize, negate, once, overArgs,
        partial, partialRight, rearg, rest, spread,
        throttle, unary, wrap
      });

    }
  };
});
