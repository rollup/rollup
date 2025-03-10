function foo() {
	return bar || 'a';
}
let bar = true;
export default function () {
	bar = false;
	return foo() !== 'b' || (foo() == 'c' && foo() == 'd');
}
