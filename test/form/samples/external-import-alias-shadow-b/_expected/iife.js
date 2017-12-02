(function (bar,bar$1) {
    'use strict';

    bar = bar && bar.hasOwnProperty('default') ? bar['default'] : bar;
    bar$1 = bar$1 && bar$1.hasOwnProperty('default') ? bar$1['default'] : bar$1;

    function foo() {
        this.bar = bar$1;
    }

    console.log(bar);
    console.log(foo);

}(bar,bar$1));
