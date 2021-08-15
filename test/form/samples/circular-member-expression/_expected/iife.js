(function () {
  'use strict';

  var foo = function() {
    foo.toString = null;
  }.toString();

  console.log(foo);

})();
