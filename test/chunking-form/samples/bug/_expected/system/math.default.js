System.register(['./add.js', './ceil.js', './divide.js', './floor.js', './max.js', './maxBy.js', './mean.js', './meanBy.js', './min.js', './minBy.js', './multiply.js', './round.js', './subtract.js', './sum.js', './sumBy.js'], function (exports, module) {
  'use strict';
  var add, ceil, divide, floor, max, maxBy, mean, meanBy, min, minBy, multiply, round, subtract, sum, sumBy;
  return {
    setters: [function (module) {
      add = module.default;
    }, function (module) {
      ceil = module.default;
    }, function (module) {
      divide = module.default;
    }, function (module) {
      floor = module.default;
    }, function (module) {
      max = module.default;
    }, function (module) {
      maxBy = module.default;
    }, function (module) {
      mean = module.default;
    }, function (module) {
      meanBy = module.default;
    }, function (module) {
      min = module.default;
    }, function (module) {
      minBy = module.default;
    }, function (module) {
      multiply = module.default;
    }, function (module) {
      round = module.default;
    }, function (module) {
      subtract = module.default;
    }, function (module) {
      sum = module.default;
    }, function (module) {
      sumBy = module.default;
    }],
    execute: function () {

      var math = exports('default', {
        add, ceil, divide, floor, max,
        maxBy, mean, meanBy, min, minBy,
        multiply, round, subtract, sum, sumBy
      });

    }
  };
});
