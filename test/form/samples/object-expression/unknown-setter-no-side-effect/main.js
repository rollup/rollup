import { unknown } from 'external';

const obj = {
	set [unknown](value) {}
};

obj.prop = true;
