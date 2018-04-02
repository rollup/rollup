(function (global, factory) {
    typeof module === 'object' && module.exports ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, (function () { 'use strict';

    var a = () => {
        console.log('props');
    };

    a();
    a();

})));
