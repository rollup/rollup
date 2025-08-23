const extra1 = { with: { type: 'json' } };
import(specifier1, extra1);

const extra2 = { with: { type: 'json' } };
import(specifier2, { with: extra2.with });

const extra3 = { with: { type: 'json' } };
import('specifier3', extra3);

const extra4 = { with: { type: 'json' } };
import('specifier4', { with: extra4.with });

const extra5 = { with: { type: 'json' } };
import(specifier5, extra5);

const extra6 = { with: { type: 'json' } };
import(specifier6, { with: extra6.with });
