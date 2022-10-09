import('a', { assert: { type: 'special' } });
import(globalThis.unknown, { assert: { type: 'special', extra: 'value' } });
import('b');
import(`external-${globalThis.unknown}`);
