(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, (function () { 'use strict';

    function bar() {
        this.baz = 1;
    }

    function foo$1() {
        this.baz = 1;
    }

    console.log(foo);

})));
