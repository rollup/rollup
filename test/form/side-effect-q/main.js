var x = true ? foo () : bar();

function foo () {
	return 'should be removed, because x is unused';
}
