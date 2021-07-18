var main = (input) => {
	try {
		JSON.parse(input);
		return true;
	} catch (e) {
		return false;
	}
};

export { main as default };
