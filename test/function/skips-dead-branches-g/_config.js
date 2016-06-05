var assert = require( 'assert' );

module.exports = {
  description: 'skips a dead conditional expression branch (g)',
  code: function ( code ) {
    assert.ok( code.indexOf( 'var c = a;' ) >= 0, code );
    assert.ok( code.indexOf( 'var d = b;' ) >= 0, code );
  }
};
