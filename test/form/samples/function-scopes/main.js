var effect = () => console.log( 'effect' );
var shadowed = () => {};
function isRemoved () {
	var shadowed = effect;
}
isRemoved();
shadowed();

var effect1 = () => console.log( 'effect' ); // must not be removed!
function isKept1 ( x = effect1 ) {
	var effect1 = () => {};
	x();
}
isKept1();

var effect2 = () => console.log( 'effect' ); // must not be removed!
var isKept2 = function ( x = effect2 ) {
	var effect2 = () => {};
	x();
};
isKept2();

var effect3 = () => console.log( 'effect' ); // must not be removed!
var isKept3 = ( x = effect3 ) => {
	var effect3 = () => {};
	x();
};
isKept3();
