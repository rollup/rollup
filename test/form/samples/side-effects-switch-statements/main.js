function noEffect () {}

function effect () {
	console.log( 'effect' );
}

switch ( globalThis.unknown ) {
	case 'foo':
	case 'bar':
		effect();
		noEffect();
		if ( globalThis.unknown > 1 ) {
			break;
		}
	case 'baz':
		effect();
	default:
		noEffect();
}

switch ( globalThis.unknown ) {
	case 'foo':
		noEffect();
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

(function nestedSwitchWithoutEffects () {
	switch ( globalThis.unknown ) {
		case 'foo':
			noEffect();
			break;
		case 'bar':
		default:
	}
}());
