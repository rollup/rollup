class proto {
	static flag = false;
	static set prop(value) {
		this.flag = value;
	}
}

class obj extends proto {}

obj.prop = true;

if (!obj.flag) {
	throw new Error('mutation not detected');
}
