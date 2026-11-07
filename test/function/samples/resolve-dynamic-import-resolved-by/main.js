export const loadObject = () => import('./object.js');
export const loadString = () => import('./string.js');
export const loadExcluded = () => import('./excluded.js');
export const loadCustom = () => import('./custom.js');
export const loadExpression = name => import(name);
export const loadUnhandled = () => import('./unhandled.js');
