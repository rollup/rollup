export function equal(a, b, message) {
	if (!message) message = format('%s does not equal %s', a, b);
	if (a != b) throw new Error(message);
}

export function ok(value, message) {
	if (!message) message = format('%s is not truthy', value);
	if (!value) throw new Error(message);
}

export function format(string_, ...arguments_) {
	return string_.replace(/%s/g, () => arguments_.shift());
}
