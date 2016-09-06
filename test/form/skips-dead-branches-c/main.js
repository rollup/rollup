var obj = {};
obj.foo = function () {
	console.log( 'this should be excluded' );
}

function bar () {
	console.log( 'this should be included' );
}

if ( !true ) obj.foo();
bar();
