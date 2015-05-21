export default function foo () {
	return bar();
}

function bar () {
	return 42;
}

function baz () {
	return 'this should be excluded';
}
