System.register(['./chunk1.js'], function (exports, module) {
    'use strict';
    var ONE_CONSTANT;
    return {
        setters: [function (module) {
            ONE_CONSTANT = module.ONE_CONSTANT;
        }],
        execute: function () {

            class Two {
                test() {
                    return ONE_CONSTANT;
                }
            } exports('ItemTwo', Two);

        }
    };
});
