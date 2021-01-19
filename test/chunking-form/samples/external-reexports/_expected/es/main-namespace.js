import * as externalAll from 'external-all';
export { externalAll as foo };
import * as externalNamespace$1 from 'external-namespace';
export { externalNamespace$1 as bar };
import * as externalDefaultNamespace from 'external-default-namespace';
export { externalDefaultNamespace as baz };
import * as externalNamedNamespace from 'external-named-namespace';
export { externalNamedNamespace as quux };

const externalNamespace = 1;
const externalNamespace__ns = 1;
console.log(externalNamespace, externalNamespace__ns);
