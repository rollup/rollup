import first from 'external-first';
import second from 'external-second';
import third from 'external-third';
import internal from 'internal';

assert.deepEqual(
	[first, second, third, internal],
	['external-first', 'external-second', 'external-third', 'internal']
);
