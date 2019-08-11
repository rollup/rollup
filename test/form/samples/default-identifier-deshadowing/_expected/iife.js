(function () {
  'use strict';

  function a() {
    a = someGlobal;
    return a();
  }

  a();

}());
