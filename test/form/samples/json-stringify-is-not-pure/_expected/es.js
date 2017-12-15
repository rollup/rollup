var main = (input) => {
	try {
		JSON.stringify(input);
		return true;
	} catch (e) {
		return false;
	}
};

export default main;
