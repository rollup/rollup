function Bar ( x ) {
	console.log( 'side effect' );
	this.value = x;
}

function Baz ( x ) {
	this[ console.log( 'side effect' ) ] = x;
}

function Qux ( x ) {
	this.value = console.log( 'side effect' );
}

function Corge ( x ) {
	this.value = x;
}

var Arrow = ( x ) => {
	undefined.value = x;
};

console.log( 'before' );
new Bar(5);
new Baz(5);
new Qux();
Corge(5);
new Arrow(5);

console.log( 'after' );
