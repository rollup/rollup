const obj = {
	flag: false,
	get prop() {
		this.flag = true;
		return 1;
	},
	set prop(v) {}
};

obj.prop += 1;

if (!obj.flag) {
	throw new Error('mutation not detected');
}
