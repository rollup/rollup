import * as ns from './namespace';

export const isNull = prop => (ns[prop] === null ? true : false);
