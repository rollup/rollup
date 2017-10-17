const multiArgument1 = function ( func, obj ) { return func( obj ); };
multiArgument1( obj => obj(), () => () => {} )();

const multiArgument2 = function ( func, obj ) { return func( obj ); };
multiArgument2( obj => obj(), () => () => console.log( 'effect' ) )();

const multiArgument3 = function ( func, obj ) { return func( obj ); };
multiArgument3( obj => ({ foo: obj }), { bar: {} } ).foo.bar.baz = 1;

const multiArgument4 = function ( func, obj ) { return func( obj ); };
multiArgument4( obj => ({ foo: obj }), {} ).foo.bar.baz = 1;
