(function (factory) {
    typeof enifed === 'function' && enifed.amd ? enifed(factory) :
    factory();
}(function () { 'use strict';

    var a = () => {
        console.log('props');
    };

    a();
    a();

}));
