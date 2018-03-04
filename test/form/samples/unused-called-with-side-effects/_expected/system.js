System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      function foo() {
        return 'foo'
      }

      assert.equal( foo(), 'foo' );

    }
  };
});
