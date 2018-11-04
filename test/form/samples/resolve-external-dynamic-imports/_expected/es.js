import myExternal from 'external';

const test = () => myExternal;

const someDynamicImport = () => import('external');

export { test, someDynamicImport };
