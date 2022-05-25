const effect = () => console.log( 'effect' );

function aDecl ( x = effect() ) {}
aDecl();

const aExp = function ( x = effect() ) {};
aExp();

const aArr = ( x = effect() ) => {};
aArr();

function bDecl ( x = effect ) {
	x();
}
bDecl();

const bExp = function ( x = effect ) {
	x();
};
bExp();

const bArr = ( x = effect ) => {
	x();
};
bArr();
