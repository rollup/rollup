function myMax(a, b) {
	return Math.max(a, b);
}

export function max(a, b) {
	return myMax(a, b, doesNotExist);
}
