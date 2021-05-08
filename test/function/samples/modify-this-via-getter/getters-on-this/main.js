const obj = {
	flag1: false,
	flag2: false,
	flag3: false,
	flag4: false,
	prop1() {
		this.flag1 = true;
		this.prop2();
	},
	prop2() {
		this.flag2 = true;
		this.prop3;
	},
	get prop3() {
		this.flag3 = true;
		this.prop4 = true;
	},
	set prop4(value) {
		this.flag4 = value;
	}
};

obj.prop1();

if (!obj.flag1) {
	throw new Error('mutation 1 not detected');
}

if (!obj.flag2) {
	throw new Error('mutation 2 not detected');
}

if (!obj.flag3) {
	throw new Error('mutation 3 not detected');
}

if (!obj.flag4) {
	throw new Error('mutation 4 not detected');
}
