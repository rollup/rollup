function effect() {
	console.log('effect');
}

switch (globalThis.unknown) {
	case 'foo':
	case 'bar':
		effect();
		if (globalThis.unknown > 1) {
			break;
		}
	case 'baz':
		effect();
		break;
}

switch (globalThis.unknown) {
	case 'foo':
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
}

for (var i = 0; i < 4; i++) {
	switch (i) {
		case 0:
		case 1:
			continue;
	}
	effect();
}

var included;
switch (effect()) {
	default:
		included = 1;
}
console.log(included);
