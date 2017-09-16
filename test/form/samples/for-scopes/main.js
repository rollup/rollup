var effect1 = () => console.log( 'effect' );
var associated = () => {};
for ( var associated = effect1; true; ) {
	break;
}
associated();

var effect2 = () => console.log( 'effect' );
let shadowed = () => {};
for ( let shadowed = effect2; true; ) {
	break;
}
shadowed();

var effect3 = () => console.log( 'effect' ); // Must not be removed!
for ( let foo = effect3; true; ) {
	let effect3 = () => {}; // This can be removed
	foo(); // Must not be removed!
	break;
}
