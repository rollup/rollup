import DefaultExport from './default-export/index.js';
console.log('test-package-default-export', DefaultExport.Item);

import { Menu as NamedExport } from './named-export/index.js';
console.log('test-package-named-export', NamedExport.Item);

export { default } from './default-export2/index.js';

