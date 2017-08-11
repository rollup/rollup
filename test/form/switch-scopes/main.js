const x = globalFunction;
function y () {}

switch ( anotherGlobal ) {
	case 1:
		const x = function () {};
		x();
}

switch ( anotherGlobal ) {
	case 2:
		x();
}

switch ( anotherGlobal ) {
	case 3:
		const y = globalFunction;
}
y();

switch ( globalFunction() ) {
	case 4:
}
