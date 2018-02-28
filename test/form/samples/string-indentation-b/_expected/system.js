System.register([], function (exports, module) {
    'use strict';
    return {
        execute: function () {

            var a = 'a',
                b = 'b';

            assert.equal( a, 'a' );
            assert.equal( b, 'b' );

        }
    };
});
