const obj = {
	flag: false,
	get prop() {
		this.flag = true;
	}
};

obj.prop;

if (!obj.flag) {
	throw new Error('mutation not detected');
}
