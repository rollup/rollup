function effect () {
	console.log( 'effect' );
}

switch ( globalThis.unknown ) {
	case 'foo':
	case 'bar':
		effect();
		if ( globalThis.unknown > 1 ) {
			break;
		}
	case 'baz':
		effect();
	default:

}

switch ( globalThis.unknown ) {
	case 'foo':
		break;
	case 'bar':
		effect();
	default:
		effect();
}

(function nestedSwitchWithEffects () {
	switch ( globalThis.unknown ) {
		default:
			effect();
	}
}());

switch ( globalThis.unknown ) {
	case effect():
}
