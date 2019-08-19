const x = globalThis.unknown;
function y () {}

switch ( globalThis.unknown ) {
	case 1:
		const x = function () {};
		x();
}

switch ( globalThis.unknown ) {
	case 2:
		x();
}

switch ( globalThis.unknown ) {
	case 3:
		const y = globalThis.unknown;
}
y();

switch ( globalThis.unknown() ) {
	case 4:
}
