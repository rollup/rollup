import { unknown } from 'external';

const obj = {
	get [unknown]() {
		this.flag = true;
	},
	flag: false
};

obj[unknown];

if (!obj.flag) {
	throw new Error('mutation not detected');
}
