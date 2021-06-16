import { unknown } from 'external';

const obj = {
	get [unknown]() {}
};

obj.prop;
