import('external', { with: { type: 'special' } });
import(globalThis.unknown, { with: { type: 'special' } });
import(`external-${globalThis.unknown}`, { with: { type: 'special' } });
import('external' + globalThis.unknown, { with: { type: 'special' } });
import('external-resolved', { with: { type: 'special' } });
import('unresolved', { with: { type: 'special' } });
