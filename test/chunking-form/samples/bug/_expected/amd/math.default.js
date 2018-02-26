define(['./add.js', './ceil.js', './divide.js', './floor.js', './max.js', './maxBy.js', './mean.js', './meanBy.js', './min.js', './minBy.js', './multiply.js', './round.js', './subtract.js', './sum.js', './sumBy.js'], function (__add_js, __ceil_js, __divide_js, __floor_js, __max_js, __maxBy_js, __mean_js, __meanBy_js, __min_js, __minBy_js, __multiply_js, __round_js, __subtract_js, __sum_js, __sumBy_js) { 'use strict';

  var math = {
    add: __add_js.default, ceil: __ceil_js.default, divide: __divide_js.default, floor: __floor_js.default, max: __max_js.default,
    maxBy: __maxBy_js.default, mean: __mean_js.default, meanBy: __meanBy_js.default, min: __min_js.default, minBy: __minBy_js.default,
    multiply: __multiply_js.default, round: __round_js.default, subtract: __subtract_js.default, sum: __sum_js.default, sumBy: __sumBy_js.default
  };

  return math;

});
