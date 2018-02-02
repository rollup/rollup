import './unused.js';
import './unusedFunction.js';
import './unusedSideEffect.js';
import importedValue from './used.js';
import importedUsedFunction from './usedFunction.js';
import importedUsedNamedFunction from './usedNamedFunction.js';

console.log(importedValue);
importedUsedFunction();
importedUsedNamedFunction();
