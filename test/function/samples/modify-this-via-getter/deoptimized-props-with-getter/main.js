import { unknown } from 'external';

const obj = {
	flag: false
};

Object.defineProperty(obj, unknown, {
	get() {
		this.flag = true;
	}
});

obj.prop;

if (!obj.flag) {
	throw new Error('mutation not detected');
}
