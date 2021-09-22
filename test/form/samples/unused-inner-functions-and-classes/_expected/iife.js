(function () {
    'use strict';

    function bar () { console.log("outer bar"); }

    function Baz() {
        function bar () { console.log("inner bar"); }
        function bog () { console.log("inner bog"); }

        return bar(), bog;
    }

    bar();
    var f = Baz();
    f();

    function getClass () {
        class MyClass {}
        return MyClass;
    }

    console.log( getClass().name );

})();
