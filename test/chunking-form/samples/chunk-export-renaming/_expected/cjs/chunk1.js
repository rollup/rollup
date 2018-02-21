'use strict';

class One {
  test() {
      return ONE_CONSTANT;
  }
}

const ONE_CONSTANT = 'oneconstant';

exports.One = One;
exports.ONE_CONSTANT = ONE_CONSTANT;
