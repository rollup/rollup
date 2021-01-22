var foo = function () {
	return 42;
};

function bar () {
	return contrivedExample( foo );
}

var answer = foo();
bar();

console.log( answer );
