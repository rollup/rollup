(function () {
	'use strict';

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
	var bar = new Bar(5);
	var baz = new Baz(5);
	var qux = new Qux(5);
	var corge = Corge(5);
	var arrow = new Arrow(5);

	console.log( 'after' );

}());
