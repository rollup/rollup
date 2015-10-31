var obj = {};
obj.foo = function () {
	console.log( 'this should be excluded' );
}

function bar () {
	console.log( 'this should be included' );
}

if ( false ) obj.foo();
else bar();
