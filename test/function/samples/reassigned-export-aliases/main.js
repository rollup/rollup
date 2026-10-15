let value = 3;

export { value, value as alias, value as 'spaced alias', value as '__proto__' };

export function set(next) {
	value = next;
}

export function increment() {
	return value++;
}

export function destructure(next) {
	[value] = [next];
}
