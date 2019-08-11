import missingDefault, { missingExport, missingFn, x } from './dep.js';

missingFn();
x(missingExport, missingDefault);
