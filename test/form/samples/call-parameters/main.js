const callArg1 = arg => arg();
callArg1( () => {} );

const callArg2 = arg => arg();
callArg2( () => console.log( 'effect' ) );
