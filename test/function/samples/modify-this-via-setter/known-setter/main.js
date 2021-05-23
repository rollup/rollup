const obj = {
	flag: false,
	set prop(value) {
		this.flag = value;
	}
};

obj.prop = true;

if (!obj.flag) {
	throw new Error('mutation not detected');
}
