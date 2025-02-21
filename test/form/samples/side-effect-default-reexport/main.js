import { Menu as DefaultExport } from './default-export/reexport.js';
console.log('test-package-default-export', DefaultExport.Item1);
console.log('test-package-default-export', DefaultExport.Item2);

import { Menu as NamedExport } from './named-export/index.js';
console.log('test-package-named-export', NamedExport.Item1);
console.log('test-package-named-export', NamedExport.Item2);

export { default } from './default-export2/index.js';
