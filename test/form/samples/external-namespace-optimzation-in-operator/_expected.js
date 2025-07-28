import * as nc from 'node:crypto';

const crypto = 'webcrypto' in nc;

export { crypto };
