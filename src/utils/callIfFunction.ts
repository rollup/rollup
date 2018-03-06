export default function callIfFunction<T>(thing: T | (() => T)) {
	return typeof thing === 'function' ? thing() : thing;
}
