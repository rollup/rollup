var effect1 = () => console.log( 'effect' );
var associated = () => {};
for ( var associated in { x: 1 } ) {
	associated = effect1;
}
associated();

var effect2 = () => console.log( 'effect' );
var shadowed = () => {};
for ( let shadowed in { x: 1 } ) {
	shadowed = effect2;
}
shadowed();

var effect3 = () => console.log( 'effect' );
for ( const foo in { x: effect3() } ) {
	let effect3 = () => {}; // This can be removed
}
