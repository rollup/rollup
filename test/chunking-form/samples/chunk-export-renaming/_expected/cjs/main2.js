'use strict';

var one = require('./generated-one.js');

class Two {
    test() {
        return one.ONE_CONSTANT;
    }
}

exports.ItemTwo = Two;
