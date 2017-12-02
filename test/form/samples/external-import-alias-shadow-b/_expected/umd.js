(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('bar1'), require('bar2')) :
    typeof define === 'function' && define.amd ? define(['bar1', 'bar2'], factory) :
    (factory(global.bar,global.bar$1));
}(this, (function (bar,bar$1) { 'use strict';

    bar = bar && bar.hasOwnProperty('default') ? bar['default'] : bar;
    bar$1 = bar$1 && bar$1.hasOwnProperty('default') ? bar$1['default'] : bar$1;

    function foo() {
        this.bar = bar$1;
    }

    console.log(bar);
    console.log(foo);

})));
