export default function callIfFunction (thing: any) {
	return typeof thing === 'function' ? thing() : thing;
}
