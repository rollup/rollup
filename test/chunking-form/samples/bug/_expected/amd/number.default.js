define(['./clamp.js', './inRange.js', './random.js'], function (__clamp_js, __inRange_js, __random_js) { 'use strict';

  var number = {
    clamp: __clamp_js.default, inRange: __inRange_js.default, random: __random_js.default
  };

  return number;

});
