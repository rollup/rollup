export function curry(fn, args = []) {
	return (..._args) =>
		(rest => (rest.length >= fn.length ? fn(...rest) : curry(fn, rest)))([...args, ..._args]);
}
