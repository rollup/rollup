import('external', { assert: { type: 'special' } });
import(globalThis.unknown, { assert: { type: 'special' } });
import(`external-${globalThis.unknown}`, { assert: { type: 'special' } });
import('external' + globalThis.unknown, { assert: { type: 'special' } });
import('external-resolved', { assert: { type: 'special' } });
import('unresolved', { assert: { type: 'special' } });
