import { unknown } from 'external';

assert.throws(() => {
	const obj = {};
	obj[unknown].prop;
}, /^TypeError: Cannot read propert.*'prop'.*$/ );
