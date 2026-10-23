import first from 'external-first';
import second from 'external-second';
import third from 'external-third';
import exact from 'external-string';
import frozen from 'FROZEN-external-fifth';
import notAtStart from 'prefix-external-fourth';
import internal from 'internal';

assert.deepEqual(
	[first, second, third, exact, frozen, notAtStart, internal],
	[
		'external-first',
		'external-second',
		'external-third',
		'external-string',
		'FROZEN-external-fifth',
		'bundled',
		'internal'
	]
);
