import { unknown } from 'external';

class proto {
	static flag = false;
	static set prop(value) {
		this.flag = value;
	}
}

class obj extends proto {}

obj[unknown] = true;

if (!obj.flag) {
	throw new Error('mutation not detected');
}
