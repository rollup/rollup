(function (global, factory) {
    typeof module === 'object' && module.exports ? factory() :
    typeof enifed === 'function' && enifed.amd ? enifed(factory) :
    (factory());
}(this, (function () { 'use strict';

    var a = () => {
        console.log('props');
    };

    a();
    a();

})));
