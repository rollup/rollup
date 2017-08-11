export default function foo () {
	bar();
	function bar () {}
}

var x = foo();
