export default function foo () {
	console.log( bar() );
}

function bar () {
	return 42;
}

function baz () {
	return 'this should be excluded';
}
