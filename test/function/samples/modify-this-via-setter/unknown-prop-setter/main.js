import { unknown } from 'external';

const obj = {
	set [unknown](value) {
		this.flag = value;
	},
	flag: false
};

obj.prop = true;

if (!obj.flag) {
	throw new Error('mutation not detected');
}
