function noEffect () {}

function effect () {
	console.log( 'effect' );
}

switch ( globalVar ) {
	case foo:
	case bar:
		effect();
		noEffect();
		if ( globalVar > 1 ) {
			break;
		}
	case baz:
		effect();
	default:
		noEffect();
}

switch ( globalVar ) {
	case foo:
		noEffect();
		break;
	case bar:
		effect();
	default:
		effect();
}

(function nestedSwitchWithEffects () {
	switch ( globalVar ) {
		default:
			effect();
	}
}());

(function nestedSwitchWithoutEffects () {
	switch ( globalVar ) {
		case foo:
			noEffect();
			break;
		case bar:
		default:
	}
}());
