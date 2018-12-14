(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}(function () { 'use strict';

    // -> Middle removed
    var kept1 = 1, kept2 = 3;

    // with comments
    var /* retained */ kept1 = 1 /* retained */, /* retained */ kept2 = 3 /* retained */; // retained

    // without spaces
    var kept1 = 1,kept2 = 3;

    // with comments without spaces
    var /* retained */kept1 = 1/* retained */,/* retained */kept2 = 3/* retained */;// retained

    // with line-breaks
    var kept1 = 1,
        kept2 = 3;

    // with line-breaks and comments
    var /* retained */ kept1 = 1, // retained
        /* retained */ kept2 = 3; // retained

    // mixed
    var kept1 = 1, // retained
        kept2 = 3;

    // -> Start and end removed
    var kept1 = 2;

    // with comments
    var /* retained */ kept1 = 2 /* retained */; // retained

    // without spaces
    var kept1 = 2;

    // with comments without spaces
    var /* retained */kept1 = 2/* retained */;// retained

    // with line-breaks
    var kept1 = 2;

    // with line-breaks and comments
    var /* retained */ kept1 = 2; // retained

    // mixed
    var  // retained
        kept1 = 2; // retained

    // -> Missing semicolons
    var kept1 = 1; // retained
    var kept1 = 1; // retained

    // -> No line-break after declaration
    var kept1 = 1; // retained
    console.log(1);

    console.log( kept1, kept2 );

}));
