export default (input) => {
	try {
		JSON.stringify(input);
		return true;
	} catch (e) {
		return false;
	}
};
