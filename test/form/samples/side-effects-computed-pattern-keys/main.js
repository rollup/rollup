const { [globalValue]: isRemoved } = { foo: 'bar' };
const { [globalValue()]: isKept } = {};
