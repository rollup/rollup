const callArg1 = arg => arg();
callArg1( () => {} );

const callArg2 = arg => arg();
callArg2( () => console.log( 'effect' ) );

const returnArg1 = arg => arg;
returnArg1( () => {} )();

const returnArg2 = arg => arg;
returnArg2( () => console.log( 'effect' ) )();
