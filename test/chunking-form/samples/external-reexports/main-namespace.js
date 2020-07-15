export * as foo from 'external-all';
export * as bar from 'external-namespace';
export * as baz from 'external-default-namespace';
export * as quux from 'external-named-namespace';

const externalNamespace = 1;
const externalNamespace__ns = 1;
console.log(externalNamespace, externalNamespace__ns);
