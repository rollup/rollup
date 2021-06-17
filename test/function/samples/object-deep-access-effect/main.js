import { unknown } from 'external';

export function expectError() {
	const obj = {};
	obj[unknown].prop;
}
