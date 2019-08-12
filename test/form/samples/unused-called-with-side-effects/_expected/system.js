System.register([], function () {
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
