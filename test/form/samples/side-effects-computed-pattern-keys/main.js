const { [globalThis.unknown]: isRemoved } = { foo: 'bar' };
const { [globalThis.unknown()]: isKept } = {};
