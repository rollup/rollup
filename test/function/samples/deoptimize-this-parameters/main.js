const obj = {
	flag: false,
	otherFlag: false,
	otherProp() {
		this.otherFlag = true;
	},
	prop() {
		this.flag = true;
		this.otherProp();
	}
};

const otherObj = {
	prop: obj.prop,
	otherProp: obj.otherProp
};

obj.prop();
otherObj.prop();
if (!obj.flag) throw new Error('first flag missing');
if (!otherObj.flag) throw new Error('second flag missing');
