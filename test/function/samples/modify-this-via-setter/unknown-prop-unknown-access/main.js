import { unknown } from 'external';

const obj = {
	set [unknown](value) {
		this.flag = value;
	},
	flag: false
};

obj[unknown] = true;

if (!obj.flag) {
	throw new Error('mutation not detected');
}
