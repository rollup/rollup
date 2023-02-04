import { unknown } from 'external';

const obj = {
	set [unknown](value) {}
};

obj[unknown] = true;

const obj2 = {
	set [unknown](value) {
		console.log('effect');
	}
};

obj2[unknown] = true;
