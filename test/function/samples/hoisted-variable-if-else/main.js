export let result;

export function test(value) {
	if (value) {
		v = 'first';
		result = v;
	} else if (false) {
		var v, w;
		result = 'second';
	} else {
		v = 'third';
		result = v;
	}

	for (var foo of value === 'loop' ? ['foo'] : [])
		if (false) var x;
		else {
			x = 'fourth';
			result = x;
		}
}
