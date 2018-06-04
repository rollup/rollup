const obj = {
	reassigned() {},
	test() {
		obj.reassigned();
	}
};

export default obj;
