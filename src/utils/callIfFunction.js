export default function callIfFunction ( thing ) {
	return typeof thing === 'function' ? thing() : thing;
}
