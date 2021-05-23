class proto {
	static flag = false;
	static get prop() {
		this.flag = true;
	}
}

class obj extends proto {}

obj.prop;

if (!obj.flag) {
	throw new Error('mutation not detected');
}
