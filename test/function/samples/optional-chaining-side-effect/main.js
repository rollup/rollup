var value;

export function get(v) {
	let g = value?.find(b => v === b);
	if (!g) {
		return;
	}
	return g.charAt(0);
}

export function set(a) {
	value = a;
}
