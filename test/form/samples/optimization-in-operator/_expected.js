var foo = {
	a: 1,
	b: 1
};

function check(name) {
	if (name in foo) return true;
	return false;
}

export { check as default };
