import { unknown } from 'external';

const obj = {
	flag: false
};

Object.defineProperty(obj, unknown, {
	set(value) {
		this.flag = value;
	}
});

obj.prop = true;

if (!obj.flag) {
	throw new Error('mutation not detected');
}
