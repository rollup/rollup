// this test is brittle, it relies on this dependency continuing
// to be structured in a certain way
import btoa from 'magic-string/src/utils/btoa';

assert.equal( btoa( 'it works' ), new Buffer( 'it works' ).toString( 'base64' ) );
