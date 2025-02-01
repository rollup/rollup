import('external', { assert: { type: 'special' } });
import(globalThis.unknown, { assert: { type: 'special' } });
import(`external-${globalThis.unknown}`, { with: { type: 'special' } });
import('external' + globalThis.unknown, { assert: { type: 'special' } });
import('external-resolved', { with: { type: 'special' } });
import('unresolved', { assert: { type: 'special' } });
