(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}(function () { 'use strict';

    var a = () => {
        console.log('props');
    };

    a();
    a();

}));
