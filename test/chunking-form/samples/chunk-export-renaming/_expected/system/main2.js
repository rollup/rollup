System.register(['./generated-chunk.js'], function (exports, module) {
    'use strict';
    var ONE_CONSTANT;
    return {
        setters: [function (module) {
            ONE_CONSTANT = module.a;
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
