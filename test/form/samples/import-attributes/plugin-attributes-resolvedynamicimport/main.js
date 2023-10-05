import('a', { with: { type: 'special' } });
import(globalThis.unknown, { with: { type: 'special', extra: 'value' } });
import('b');
import(`external-${globalThis.unknown}`);
