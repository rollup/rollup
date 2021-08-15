define(['exports', './generated-main'], (function (exports, main) { 'use strict';

  function mult (num) {
    return num + main.multiplier;
  }

  exports.mult = mult;

}));
