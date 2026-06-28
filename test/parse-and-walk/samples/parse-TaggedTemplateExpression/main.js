function tag(strings, value) {
	return strings[0] + value;
}
export default tag`value: ${42}`;
