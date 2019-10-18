function noEffect() {}

function effect() {
	console.log('effect');
}

switch (globalThis.unknown) {
	case 'foo':
	case 'bar':
		effect();
		noEffect();
		if (globalThis.unknown > 1) {
			break;
		}
	case 'baz':
		effect();
		break;
	case noEffect():
		noEffect();
		break;
	default:
		noEffect();
		break;
}

switch (globalThis.unknown) {
	case 'foo':
		noEffect();
		break;
	case 'bar':
		effect();
	default:
		effect();
}

(function nestedSwitchWithEffects() {
	switch (globalThis.unknown) {
		default:
			effect();
	}
})();

(function nestedSwitchWithoutEffects() {
	switch (globalThis.unknown) {
		case 'foo':
			noEffect();
			break;
		case 'bar':
		default:
	}
})();

switch (globalThis.unknown) {
	case effect():
}

switch (effect()) {
}

switch (globalThis.unknown) {
	default:
	case 'foo':
		effect();
		break;
	case 'bar':
		noEffect();
}

for (var i = 0; i < 4; i++) {
	switch (i) {
		case 0:
		case 1:
			continue;
	}
	effect();
}
