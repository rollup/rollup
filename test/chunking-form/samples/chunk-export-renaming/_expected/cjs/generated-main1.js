'use strict';

class One {
  test() {
      return ONE_CONSTANT;
  }
}

const ONE_CONSTANT = 'oneconstant';

exports.ONE_CONSTANT = ONE_CONSTANT;
exports.One = One;
