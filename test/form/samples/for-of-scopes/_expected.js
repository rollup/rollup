var effect1 = () => console.log( 'effect' );
var associated = () => {};
for ( var associated of [ effect1 ] ) {}
associated();

var effect2 = () => console.log( 'effect' );
for ( let shadowed of [ effect2 ] ) {}

var effect3 = () => console.log( 'effect' ); // Must not be removed!
for ( const foo of [ effect3 ] ) {
	foo(); // Must not be removed!
}

for ( globalThis.unknown of [ 1 ] ) {}
