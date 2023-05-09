'use strict';

var main1 = require('./generated-main1.js');

class Two {
    test() {
        return main1.ONE_CONSTANT;
    }
}

exports.ItemTwo = Two;
