const callArg1 = arg => arg();
callArg1( () => {} );

const callArg2 = arg => arg();
callArg2( () => console.log( 'effect' ) );

const assignArg1 = arg => arg.foo.bar = 1;
assignArg1( { foo: {} } );

const assignArg2 = arg => arg.foo.bar = 1;
assignArg2( {} );

const returnArg1 = arg => arg;
returnArg1( () => {} )();

const returnArg2 = arg => arg;
returnArg2( () => console.log( 'effect' ) )();

const returnArg3 = arg => arg;
returnArg3( { foo: {} } ).foo.bar = 1;

const returnArg4 = arg => arg;
returnArg4( {} ).foo.bar = 1;

const returnArg5 = arg => arg;
returnArg5( () => () => {} )()();

const returnArg6 = arg => arg;
returnArg6( () => () => console.log( 'effect' ) )()();

const returnArgReturn1 = arg => arg();
returnArgReturn1( () => () => {} )();

const returnArgReturn2 = arg => arg();
returnArgReturn2( () => () => console.log( 'effect' ) )();

const returnArgReturn3 = arg => arg();
returnArgReturn3( () => ({ foo: {} }) ).foo.bar = 1;

const returnArgReturn4 = arg => arg();
returnArgReturn4( () => ({}) ).foo.bar = 1;

const returnArgReturn5 = arg => arg();
returnArgReturn5( () => () => () => {} )()();

const returnArgReturn6 = arg => arg();
returnArgReturn6( () => () => () => console.log( 'effect' ) )()();

const multiArgument1 = ( func, obj ) => func( obj );
multiArgument1( obj => obj(), () => {} );

const multiArgument2 = ( func, obj ) => func( obj );
multiArgument2( obj => obj(), () => console.log( 'effect' ) );

const multiArgument3 = ( func, obj ) => func( obj );
multiArgument3( obj => obj.foo.bar = 1, { foo: {} } );

const multiArgument4 = ( func, obj ) => func( obj );
multiArgument4( obj => obj.foo.bar = 1, {} );
