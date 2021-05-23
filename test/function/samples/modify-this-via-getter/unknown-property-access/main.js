import { unknown } from 'external';

const obj = {
	flag: false,
	get prop() {
		this.flag = true;
	}
};

obj[unknown];

if (!obj.flag) {
	throw new Error('mutation not detected');
}
